import type { RequestEvent } from '@sveltejs/kit';
import { redis_client } from '../db/redis';
import { z } from 'zod';

const sessionDataSchema = z.object({
  googleUserId: z.string(),
  username: z.string(),
  accessToken: z.string(),
//  refreshToken: z.string(),
  expiresAt: z.number()
});

export type UserSessionData = z.infer<typeof sessionDataSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRedisSessionResult(data: any): UserSessionData | null {
  try {
    return sessionDataSchema.parse(data);
  } catch(error) {
    console.error("Invalid session data", error);
    return null;
  }
}

export async function createSession(sessionId: string, userData: UserSessionData): Promise<UserSessionData> {
  const sessionKey = `session:${sessionId}`;
  await redis_client.hset(sessionKey, {
    googleUserId: userData.googleUserId,
    username: userData.username,
    accessToken: userData.accessToken,
//    refreshToken: userData.refreshToken,
    expiresAt: (Date.now() + 1000 * 60 * 60 * 24 * 30).toString() // 30 days
  });
  // Check if this is correct approach
  await redis_client.expire(sessionKey, 60 * 60 * 24 * 30); // 30 days

  const session: UserSessionData = {
    googleUserId: userData.googleUserId,
    username: userData.username,
    accessToken: userData.accessToken,
//    refreshToken: userData.refreshToken,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
  }

  return session;
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

  if (Date.now() > parsedSessionData.expiresAt) {
    await redis_client.del(sessionKey);
    return null;
  }

  return parsedSessionData;
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

export async function deleteSession(sessionId: string): Promise<void> {
  const sessionKey = `session:${sessionId}`;
  await redis_client.del(sessionKey);
}

export function setSessionCookie(event: RequestEvent, sessionId: string, expiresAt: Date): void {
  event.cookies.set("session", sessionId, {
    httpOnly: true,
    path: "/",
//    secure: process.env.NODE_ENV === "production", need to check it
    sameSite: "lax",
    expires: expiresAt,
  });
}

export function deleteSessionCookie(event: RequestEvent): void {
  event.cookies.delete("session", { path: "/" });
}