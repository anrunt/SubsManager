import { redirect, type Actions } from "@sveltejs/kit";
import { google, type youtube_v3 } from 'googleapis';
import { isTokenExpired, refreshAccessTokenWithExpiry } from "$lib/auth/oauth";
import type { YouTubeSubscription, YoutubeSubs } from '$lib/types/types';
import { updateSessionTokens } from "$lib/server/session";
import type { GaxiosResponse } from 'gaxios';
import { z } from 'zod';
import { error } from "@sveltejs/kit";
import { MAX_SELECTION } from "./columns";

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
      subscriptions: transformedSubscriptions
    };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      subscriptions: []
    };
  }
};

export const actions: Actions = {
  deleteSubscriptions: async (event) => {
    if (event.locals.user === null) {
      throw redirect(302, "/login");
    }

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
      selectedSubscriptions = [];
    }

    if (selectedSubscriptions.length > MAX_SELECTION) {
      error(400, `You have selected more subscriptions than allowed. Please select up to ${MAX_SELECTION} subscriptions.`);
    }

    console.log("Selected subs:", selectedSubscriptions);

//    const oauth2Client = new google.auth.OAuth2();
//    oauth2Client.setCredentials({ access_token: accessToken });
    
    return { success: true };
  }
}