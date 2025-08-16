import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

import { google } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";
import { error } from "@sveltejs/kit";
import { sessionLifetime } from "$lib/helper/helper";
import { getOrCreateSessionForGoogleUser, setSessionCookie } from "$lib/server/session";
import { redis_client } from "$lib/db/redis";

interface GoogleClaims {
  sub: string;
  name: string;
}

export async function GET(event: RequestEvent): Promise<Response> {
  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("google_oauth_state") ?? null;
  const codeVerifier = event.cookies.get("google_code_verifier") ?? null;

  if (code === null || state === null || storedState === null || codeVerifier === null) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/"
      }
    });
  }

  if (state !== storedState) {
    error(400, 'Invalid OAuth state parameter, please try again');
  }

  event.cookies.delete("google_oauth_state", { path: "/" });
  event.cookies.delete("google_code_verifier", { path: "/" });

  let tokens: OAuth2Tokens;

  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    error(400, `Failed to validate authorization code, please try again`);
  }

  const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
  const googleUserId = claims.sub;
  const username = claims.name;
  
  const accessTokenExpiresAt = tokens.accessTokenExpiresAt().getTime() / 1000;
  
  const sessionId = await getOrCreateSessionForGoogleUser({
    googleUserId,
    username,
    accessToken: tokens.accessToken(),
    refreshToken: tokens.refreshToken(),
    accessTokenExpiresAt
  });

  if (sessionId === null) {
    error(500, 'Failed to create user session, please try again');
  }

  const userGoogleIdKey = `user:${googleUserId}`;
  await redis_client.set(userGoogleIdKey, "0", {
    nx: true
  }); 

  setSessionCookie(event, sessionId, new Date(Date.now() + sessionLifetime));

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/"
    }
  });
}