import type { RequestEvent } from "@sveltejs/kit";
import { redis_client } from "../db/redis";
import { generateSecureRandomString, sessionLifetime } from "../helper/helper";
import type { UserSessionData } from "$lib/types/types";
import { sessionDataSchema } from "$lib/types/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRedisSessionResult(data: any): UserSessionData | null {
  try {
    return sessionDataSchema.parse(data);
  } catch (error) {
    console.error("Invalid session data", error);
    return null;
  }
}

export async function validateSession(sessionId: string): Promise<UserSessionData | null> {
  const sessionKey = `session:${sessionId}`;
  const sessionData = await redis_client.hgetall(sessionKey);
  if (!sessionData || Object.keys(sessionData).length === 0) {
    return null;
  }

  const parsedSessionData = parseRedisSessionResult(sessionData);
  if (!parsedSessionData) {
    return null;
  }

  return parsedSessionData;
}

export async function getOrCreateSessionForGoogleUser(userData: UserSessionData): Promise<string | null> {
  const userGoogleIdKey = `user_google_id:${userData.googleUserId}`;
  let sessionId: string | null = await redis_client.get(userGoogleIdKey);

  // Session exists, extend the session lifetime
  if (sessionId) {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redis_client.hgetall(sessionKey);

    if (!sessionData || Object.keys(sessionData).length === 0) {
      await redis_client.del(userGoogleIdKey);
    } else {
      await redis_client.expire(userGoogleIdKey, sessionLifetime / 1000);
      await redis_client.expire(sessionKey, sessionLifetime / 1000);
      return sessionId;
    }
  }

  sessionId = generateSecureRandomString();
  const setResult = await redis_client.set(userGoogleIdKey, sessionId, {
    ex: sessionLifetime / 1000,
    nx: true
  });

  if (setResult === null) {
    sessionId = await redis_client.get(userGoogleIdKey);
    return sessionId;
  }

  const sessionKey = `session:${sessionId}`;
  await redis_client.hset(sessionKey, {
    googleUserId: userData.googleUserId,
    username: userData.username,
    accessToken: userData.accessToken,
    refreshToken: userData.refreshToken
  });
  await redis_client.expire(sessionKey, sessionLifetime / 1000);

  return sessionId;
}

export async function getSession(sessionId: string): Promise<UserSessionData | null> {
  const sessionKey = `session:${sessionId}`;
  const sessionData = await redis_client.hgetall(sessionKey);
  if (!sessionData || Object.keys(sessionData).length === 0) {
    return null;
  }

  const parsedSessionData = parseRedisSessionResult(sessionData);
  if (!parsedSessionData) {
    return null;
  }

  return parsedSessionData;
}

export async function deleteSession(sessionId: string, googleUserId: string): Promise<void> {
  const sessionKey = `session:${sessionId}`;
  const userGoogleIdKey = `user_google_id:${googleUserId}`;
  await redis_client.del(sessionKey);
  await redis_client.del(userGoogleIdKey);
}

export function setSessionCookie(event: RequestEvent, sessionId: string, expiresAt: Date): void {
  event.cookies.set("session", sessionId, {
    httpOnly: true,
    path: "/",
    //    secure: process.env.NODE_ENV === "production" <- its for https
    sameSite: "lax",
    expires: expiresAt
  });
}

export function deleteSessionCookie(event: RequestEvent): void {
  event.cookies.delete("session", { path: "/" });
}
