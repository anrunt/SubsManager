import { getRequestEvent, query } from "$app/server";
import { redis_client } from "$lib/db/redis";
import { subsCountTtl } from "$lib/helper/helper";
import { isTokenExpired, refreshAccessTokenWithExpiry } from "$lib/server/oauth";
import { updateSessionTokens } from "$lib/server/session";
import type { cachedDates, cachedDatesHelper, YoutubeSubs, YouTubeSubscription } from "$lib/types/types";
import { redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { GaxiosResponse } from 'gaxios';
import { google, type youtube_v3 } from 'googleapis';
import pLimit from "p-limit";

const MAX_SELECTION = 50;

const deletedSubsNumberSchema = z.coerce.number();

async function getLastVideoPublishedAt(accessToken: string, channelId: string ) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    const channelResponse: GaxiosResponse<youtube_v3.Schema$ChannelListResponse> = await google.youtube('v3').channels.list({
      auth: oauth2Client,
      part: ['contentDetails'],
      id: [channelId!],
      maxResults: 1,
    });

    const channel = channelResponse.data.items?.[0];
    
    if (!channel) {
      console.log(`Channel ${channelId} not found - may have been deleted or made private`);
      return null;
    }

    const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.log(`Channel ${channelId} has no upload playlist`);
      return null;
    }

    const playlistResponse = await google.youtube('v3').playlistItems.list({
      auth: oauth2Client,
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults: 1,
    })

    const items = playlistResponse.data.items ?? [];

    if (items.length === 0) {
      console.log(`Channel ${channelId} has no videos in upload playlist`)
      return null;
    }

    const lastVideo = items[0];

    return lastVideo.snippet?.publishedAt ?? null;
  } catch(error) {
    const errorObj = error as { status?: number; code?: number; message?: string };
    if (errorObj.status === 404 || errorObj.code === 404) {
      console.log(`Channel ${channelId} playlist not found (404)`);
      return null;
    } else if (errorObj.status === 403 || errorObj.code === 403) {
      console.log(`Channel ${channelId} playlist is private or access forbidden (403)`);
      return null;
    } else {
      console.error(`Unexpected error fetching data for channel ${channelId}:`, errorObj.message || error);
      return null;
    }
  }
}

export const getSubs = query(async () => {
  const { cookies, locals } = getRequestEvent();

  if (locals.user === null) {
    throw redirect(302, "/login");
  }

  let { accessToken, refreshToken, accessTokenExpiresAt } = locals.user;

  const sessionId = cookies.get("session")!;

  if (isTokenExpired(accessTokenExpiresAt)) {
    try {
      console.log("Refreshing acces token inside load function")
      const newTokens = await refreshAccessTokenWithExpiry(refreshToken);
      accessToken = newTokens.accessToken;
      refreshToken = newTokens.refreshToken;
      accessTokenExpiresAt = newTokens.expiresAt;
      
      await updateSessionTokens(sessionId, {
        accessToken,
        refreshToken, 
        accessTokenExpiresAt
      });
      
      console.log("Access token refreshed proactively");
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw redirect(302, "/login");
    }
  }

  const googleUserIdKey = `user:${locals.user.googleUserId}`;
  const deletedSubsNumberRawFirst = await redis_client.get(googleUserIdKey);
  console.log(`LOAD - First get result: ${deletedSubsNumberRawFirst} for user ${locals.user.googleUserId}`);

  if (deletedSubsNumberRawFirst === null) {
    const setResult = await redis_client.set(googleUserIdKey, "0", {
      ex: subsCountTtl / 1000,
      nx: true
    });
    console.log(`LOAD - Set result: ${setResult} with TTL ${subsCountTtl / 1000}s`);
  }

  const deletedSubsNumberRaw = await redis_client.get(googleUserIdKey);
  const deletedSubsNumber = deletedSubsNumberSchema.parse(deletedSubsNumberRaw);

  const remainingSubs = MAX_SELECTION - deletedSubsNumber;

  // There we get the user ttl for limit reset
  let subsLockTimeReset = await redis_client.ttl(googleUserIdKey);
  console.log(`LOAD - TTL check: ${subsLockTimeReset}`);
  
  if (subsLockTimeReset === -1) {
    await redis_client.expire(googleUserIdKey, subsCountTtl / 1000);
    subsLockTimeReset = await redis_client.ttl(googleUserIdKey);
    console.log(`LOAD - Fixed TTL from forever to: ${subsLockTimeReset}`);
  }


  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    let allSubscriptions: YouTubeSubscription[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const response: GaxiosResponse<youtube_v3.Schema$SubscriptionListResponse> = await google.youtube('v3').subscriptions.list({
        auth: oauth2Client,
        part: ['snippet'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      if (response.data.items) {
        allSubscriptions = allSubscriptions.concat(response.data.items as YouTubeSubscription[]);
      }
      nextPageToken = response.data.nextPageToken || undefined;

    } while (nextPageToken);

    console.log('Total subscriptions fetched:', allSubscriptions.length);

    const transformedSubscriptions: YoutubeSubs[] = allSubscriptions
      .map((subscription) => ({
        channelPicture: subscription.snippet.thumbnails.medium?.url || subscription.snippet.thumbnails.default?.url || '',
        channelName: subscription.snippet.title,
        channelLink: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
        channelId: subscription.snippet.resourceId.channelId,
        subscriptionId: subscription.id
      }));
    
    // Here we check if there is some data cached, if yes we use this cache if not we proceed to make api calls to youtube
    const cacheName2 = `cache:${locals.user.googleUserId}`;
    const cachedSubs = await redis_client.hgetall(cacheName2) as unknown as cachedDates;
    console.log(cachedSubs);

    if (cachedSubs !== null) {
      console.log("Dane z redis")
      // Get the lastVideoDates from cache and return data
      // Check if the redis cache === youtube subs from api call, if not we have to make additional api call for only that umatching sub 
      // and then we add it to the cache.

      const lastVideoDateMap: Map<string, string | null> = new Map(Object.entries(cachedSubs));

      if (lastVideoDateMap.size !== transformedSubscriptions.length) {
        // Here we check which sub is missing in lastVideoDateMap
        const missingSubscriptions: cachedDatesHelper[] = [];

        transformedSubscriptions.map(sub => {
          const missingSubInfo = lastVideoDateMap.get(sub.subscriptionId);

          if (missingSubInfo === undefined) {
            const newRecord: cachedDatesHelper = {
              subscriptionId: sub.subscriptionId,
              channelId: sub.channelId
            }
            missingSubscriptions.push(newRecord);
          }
        })

        console.log("Missing Subscriptions: ", missingSubscriptions);

        // Get the lastVideoDate
        const limit = pLimit(15);
        const subscriptionsWithLastVideo = await Promise.all(
          missingSubscriptions.map(sub => {
            return limit(async () => {
              try {
                const lastVideo = await getLastVideoPublishedAt(accessToken, sub.channelId);
                return {
                  ...sub,
                  lastVideoPublishedAt: lastVideo
                };
              } catch (error: any) {
                if (error.status === 429 || error.code === 429) {
                  console.log("Rate-limited");
                }
                return {
                  ...sub,
                  lastVideoPublishedAt: null
                }
              }
            })
          })
        )
        // Update the cache
        const cacheName = `cache:${locals.user.googleUserId}`;
        const lastVideoDateCache = Object.fromEntries(subscriptionsWithLastVideo.map(sub => [sub.subscriptionId, sub.lastVideoPublishedAt]));
        await redis_client.hset(cacheName, lastVideoDateCache);
        await redis_client.expire(cacheName, 7200); // 2 hours

        // Update the map
        subscriptionsWithLastVideo.map(sub => {
          lastVideoDateMap.set(sub.subscriptionId, sub.lastVideoPublishedAt);
        })
      }

      const subscriptionsWithLastVideo = transformedSubscriptions.map(sub => {
        const lastVideoDate = lastVideoDateMap.get(sub.subscriptionId) || null;
        return {
          ...sub,
          lastVideoPublishedAt: lastVideoDate
        }
      })

      return {
        subscriptions: subscriptionsWithLastVideo,
        allSubscriptions: allSubscriptions,
        remainingSubs: remainingSubs,
        subsLockTimeReset: subsLockTimeReset
      };
    }


    console.log("Wykonuje api calla po videoDate")
    const limit = pLimit(15);
    const subscriptionsWithLastVideo = await Promise.all(
      transformedSubscriptions.map(sub => {
        return limit(async () => {
          try {
            const lastVideo = await getLastVideoPublishedAt(accessToken, sub.channelId);
            return {
              ...sub,
              lastVideoPublishedAt: lastVideo
            };
          } catch (error: any) {
            if (error.status === 429 || error.code === 429) {
              console.log("Rate-limited");
            }
            return {
              ...sub,
              lastVideoPublishedAt: null
            }
          }
        })
      })
    )

    // Here we put cache data in redis
    const cacheName = `cache:${locals.user.googleUserId}`;
    const lastVideoDateCache = Object.fromEntries(subscriptionsWithLastVideo.map(sub => [sub.subscriptionId, sub.lastVideoPublishedAt]));
    await redis_client.hset(cacheName, lastVideoDateCache);
    await redis_client.expire(cacheName, 7200); // 2 hours

    return {
      subscriptions: subscriptionsWithLastVideo,
      allSubscriptions: allSubscriptions,
      remainingSubs: remainingSubs,
      subsLockTimeReset: subsLockTimeReset
    };
  } catch (error: any) {
    console.error("API call failed:", error);
    
    // Check if error is due to insufficient permissions
    if (error.status === 403 || error.code === 403) {
      const errorReason = error.errors?.[0]?.reason;
      if (errorReason === 'insufficientPermissions') {
        console.error("User does not have YouTube permissions - redirecting to login");
        throw redirect(302, "/login?error=youtube_permission_required");
      }
    }
    
    return {
      subscriptions: [],
      allSubscriptions: [],
      remainingSubs: 0,
      subsLockTimeReset: -1
    };
  }
})