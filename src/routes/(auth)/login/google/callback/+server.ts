import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

import { google } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";
import { error } from "@sveltejs/kit";
import { sessionLifetime } from "$lib/helper/helper";
import { getOrCreateSessionForGoogleUser, setSessionCookie } from "$lib/server/session";

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
  
  const grantedScopes = tokens.scopes();
  const requiredYouTubeScope = "https://www.googleapis.com/auth/youtube";
  
  if (!grantedScopes.includes(requiredYouTubeScope)) {
    console.error(`User ${googleUserId} did not grant YouTube permissions. Granted scopes:`, grantedScopes);
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?error=youtube_permission_required"
      }
    });
  }
  
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

  setSessionCookie(event, sessionId, new Date(Date.now() + sessionLifetime));

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/"
    }
  });
}