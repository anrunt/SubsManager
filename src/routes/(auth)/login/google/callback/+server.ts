import { google } from "$lib/auth/oauth";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import { generateSecureRandomString, sessionLifetime } from "$lib/helper/helper";
import { createSession, setSessionCookie } from "$lib/server/session";

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
      status: 400
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400
    });
  }

  let tokens: OAuth2Tokens;

  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    return new Response(null, {
      status: 400
    });
  }

  const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;

  console.log("Claims: ", claims);

  const googleUserId = claims.sub;
  const username = claims.name;

  const sessionId = generateSecureRandomString();
  await createSession(sessionId, {
    googleUserId,
    username,
    accessToken: tokens.accessToken(),
  });

  setSessionCookie(event, sessionId, new Date(Date.now() + sessionLifetime));

  return new Response(null, {
    status: 302,
    headers: {
      location: "/"
    }
  });
}