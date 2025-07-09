import type { RequestEvent } from "@sveltejs/kit";
import { redis_client } from "../db/redis";
import { z } from "zod";
import { sessionLifetime } from "../helper/helper";

const sessionDataSchema = z.object({
  googleUserId: z.string(),
  username: z.string(),
  accessToken: z.string()
});

export type UserSessionData = z.infer<typeof sessionDataSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRedisSessionResult(data: any): UserSessionData | null {
  try {
    return sessionDataSchema.parse(data);
  } catch (error) {
    console.error("Invalid session data", error);
    return null;
  }
}

export async function createSession(sessionId: string, userData: UserSessionData): Promise<void> {
  const sessionKey = `session:${sessionId}`;
  await redis_client.hset(sessionKey, {
    googleUserId: userData.googleUserId,
    username: userData.username,
    accessToken: userData.accessToken
  });
  await redis_client.expire(sessionKey, sessionLifetime / 1000); // Converting to ms for redis
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
    //    secure: process.env.NODE_ENV === "production" <- its for https
    sameSite: "lax",
    expires: expiresAt
  });
}

export function deleteSessionCookie(event: RequestEvent): void {
  event.cookies.delete("session", { path: "/" });
}
