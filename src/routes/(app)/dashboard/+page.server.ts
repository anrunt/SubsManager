import { fail, redirect, type Actions } from "@sveltejs/kit";
import { google, type youtube_v3 } from 'googleapis';
import { isTokenExpired, refreshAccessTokenWithExpiry } from "$lib/server/oauth";
import type { YouTubeSubscription, YoutubeSubs } from '$lib/types/types';
import { updateSessionTokens } from "$lib/server/session";
import type { GaxiosResponse } from 'gaxios';
import { z } from 'zod';
import pLimit from 'p-limit';
import { redis_client } from "$lib/db/redis";
import { sessionLifetime } from "$lib/helper/helper";

const MAX_SELECTION = 50;

const deletedSubsNumberSchema = z.coerce.number();

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

  if (deletedSubsNumberRawFirst === null) {
    await redis_client.set(googleUserIdKey, "0", {
      ex: sessionLifetime / 1000,
      nx: true
    }); 
  }

  const deletedSubsNumberRaw = await redis_client.get(googleUserIdKey);
  const deletedSubsNumber = deletedSubsNumberSchema.parse(deletedSubsNumberRaw);

  const remainingSubs = MAX_SELECTION - deletedSubsNumber;

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

    const transformedSubscriptions: YoutubeSubs[] = allSubscriptions.map((subscription) => ({
      channelPicture: subscription.snippet.thumbnails.medium?.url || subscription.snippet.thumbnails.default?.url || '',
      channelName: subscription.snippet.title,
      channelLink: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
      subscriptionId: subscription.id
    }));

    return {
      subscriptions: transformedSubscriptions,
      remainingSubs: remainingSubs
    };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      subscriptions: [],
      remainingSubs: 0
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

    const limit = pLimit(5);

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

    // Here we update the deleted subs number
    await redis_client.incrby(googleUserIdKey, selectedSubscriptions.length);

    return { success: true };
  }
}