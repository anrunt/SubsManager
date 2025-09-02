import { fail, redirect, type Actions } from "@sveltejs/kit";
import { google, type youtube_v3 } from 'googleapis';
import { isTokenExpired, refreshAccessTokenWithExpiry } from "$lib/server/oauth";
import type { YouTubeSubscription, YoutubeSubs } from '$lib/types/types';
import { updateSessionTokens } from "$lib/server/session";
import type { GaxiosResponse } from 'gaxios';
import { z } from 'zod';
import pLimit from 'p-limit';
import { redis_client } from "$lib/db/redis";
import { subsCountTtl } from "$lib/helper/helper";

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

export const load = async (event) => {
  if (event.locals.user === null) {
    throw redirect(302, "/login");
  }

  let { accessToken, refreshToken, accessTokenExpiresAt } = event.locals.user;
  const sessionId = event.cookies.get("session")!;

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

  const googleUserIdKey = `user:${event.locals.user.googleUserId}`;
  const deletedSubsNumberRawFirst = await redis_client.get(googleUserIdKey);
  console.log(`LOAD - First get result: ${deletedSubsNumberRawFirst} for user ${event.locals.user.googleUserId}`);

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

    const limit = pLimit(15);
    const subscriptionsWithLastVideo = await Promise.all(
      transformedSubscriptions.map(sub => {
        return limit(async () => {
          const lastVideo = await getLastVideoPublishedAt(accessToken, sub.channelId);
          return {
            ...sub,
            lastVideoPublishedAt: lastVideo
          };
        })
      })
    )

    return {
      subscriptions: subscriptionsWithLastVideo,
      allSubscriptions: allSubscriptions,
      remainingSubs: remainingSubs,
      subsLockTimeReset: subsLockTimeReset
    };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      subscriptions: [],
      allSubscriptions: [],
      remainingSubs: 0,
      subsLockTimeReset: -1
    };
  }
};

export const actions: Actions = {
  deleteSubscriptions: async (event) => {
    if (event.locals.user === null) {
      throw redirect(302, "/login");
    }

    const data = await event.request.formData();
    const selectedSubscriptionsRaw = data.get('selectedSubscriptions');
    
    const subscriptionIdsSchema = z.string().transform((str) => {
      return str.split(',').map(id => id.trim()).filter(id => id);
    });
    
    let selectedSubscriptions: string[] = [];
    
    try {
      selectedSubscriptions = subscriptionIdsSchema.parse(selectedSubscriptionsRaw);
    } catch (error) {
      console.error("Invalid selectedSubscriptions format:", error);
      return fail(400, {
        error: "Invalid selectedSubscriptions format."
      });
    }

    if (selectedSubscriptions.length === 0) {
      return fail(400, {
        error: "No subscriptions selected."
      });
    }

    const googleUserIdKey = `user:${event.locals.user.googleUserId}`;
    const deletedSubsNumberRaw = await redis_client.get(googleUserIdKey);
    const deletedSubsNumber = deletedSubsNumberSchema.parse(deletedSubsNumberRaw);
    const remainingSubs = MAX_SELECTION - deletedSubsNumber;

    if (selectedSubscriptions.length > remainingSubs) {
      return fail(400, { error: "You have selected more subscriptions than allowed!" });
    }

    console.log("Selected subs:", selectedSubscriptions);

    let { accessToken, refreshToken, accessTokenExpiresAt } = event.locals.user;
    const sessionId = event.cookies.get("session")!;

    if (isTokenExpired(accessTokenExpiresAt)) {
      try {
        console.log("Refreshing acces token inside deleteSubscriptions action")
        const newTokens = await refreshAccessTokenWithExpiry(refreshToken);
        accessToken = newTokens.accessToken;
        refreshToken = newTokens.refreshToken;
        accessTokenExpiresAt = newTokens.expiresAt;
        
        await updateSessionTokens(sessionId, {
          accessToken,
          refreshToken, 
          accessTokenExpiresAt
        });
        
        console.log("Access token refreshed in form action");
      } catch (error) {
        console.error("Failed to refresh access token in form action:", error);
        throw redirect(302, "/login");
      }
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const limit = pLimit(15);

    const deleteTasks = selectedSubscriptions.map((id) => {
      return limit(async () => {
        try {
          await google.youtube('v3').subscriptions.delete({
            id: id,
            auth: oauth2Client,
          });
          console.log(`Deleted ${id}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          console.error(`Error in deleting ${id}, err mess: ${err}`)
        }
      })
    })

    await Promise.allSettled(deleteTasks);

    const keyExists = await redis_client.exists(googleUserIdKey);
    console.log(`DELETE ACTION - Key exists check: ${keyExists} for user ${event.locals.user.googleUserId}`);
    
    if (keyExists === 0) {
      const setResult = await redis_client.set(googleUserIdKey, "0", {
        ex: subsCountTtl / 1000,
        nx: true
      });
      console.log(`DELETE ACTION - Set result: ${setResult} with TTL ${subsCountTtl / 1000}s`);
    }

    await redis_client.incrby(googleUserIdKey, selectedSubscriptions.length);
    
    let ttlAfter = await redis_client.ttl(googleUserIdKey);
    console.log(`DELETE ACTION - TTL after incrby: ${ttlAfter}`);
    
    if (ttlAfter === -1) {
      await redis_client.expire(googleUserIdKey, subsCountTtl / 1000);
      ttlAfter = await redis_client.ttl(googleUserIdKey);
      console.log(`DELETE ACTION - Fixed TTL from forever to: ${ttlAfter}`);
    }

    return { success: true };
  }
}