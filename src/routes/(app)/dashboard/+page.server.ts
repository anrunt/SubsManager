import { fail, redirect, type Actions } from "@sveltejs/kit";
import { google } from 'googleapis';
import { isTokenExpired, refreshAccessTokenWithExpiry } from "$lib/server/oauth";
import { updateSessionTokens } from "$lib/server/session";
import { z } from 'zod';
import pLimit from 'p-limit';
import { redis_client } from "$lib/db/redis";
import { subsCountTtl } from "$lib/helper/helper";
import type { cachedDates } from "$lib/types/types";

const MAX_SELECTION = 80;

const deletedSubsNumberSchema = z.coerce.number();

export const load = async (event) => {
  if (event.locals.user === null) {
    throw redirect(302, "/login");
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

    // Check if cache exists and if yes, delete the deleted subs from it.
    const cacheName = `cache:${event.locals.user.googleUserId}`;
    const cachedSubs = await redis_client.hgetall(cacheName) as unknown as cachedDates;

    if (cachedSubs !== null) {
      await redis_client.hdel(cacheName, ...selectedSubscriptions);
      console.log("Deleted selected subs from cache");
    }

    return { success: true };
  }
}