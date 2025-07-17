import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

import { google } from "$lib/auth/oauth";
import { decodeIdToken } from "arctic";
import { generateSecureRandomString, sessionLifetime } from "$lib/helper/helper";
import { createSession, setSessionCookie } from "$lib/server/session";

interface GoogleClaims {
  sub: string;
  name: string;
}

export async function GET(event: RequestEvent): Promise<Response> {
  console.log("Callback google");
  
  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("google_oauth_state") ?? null;
  const codeVerifier = event.cookies.get("google_code_verifier") ?? null;

  console.log("OAuth params - code:", code ? "present" : "missing");
  console.log("OAuth params - state:", state);
  console.log("OAuth params - storedState:", storedState);
  console.log("OAuth params - codeVerifier:", codeVerifier ? "present" : "missing");

  if (code === null || state === null || storedState === null || codeVerifier === null) {
    console.log("Missing OAuth parameters, redirecting to login");
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/"
      }
    });
  }

  if (state !== storedState) {
    console.log("OAuth state mismatch, potential CSRF attack");
    return new Response(null, {
      status: 400
    });
  }

  console.log("Deleting OAuth cookies");
  event.cookies.delete("google_oauth_state", { path: "/" });
  event.cookies.delete("google_code_verifier", { path: "/" });

  let tokens: OAuth2Tokens;

  try {
    console.log("Validating OAuth authorization code");
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
    console.log("OAuth tokens validated successfully");
  } catch (e) {
    console.error("Failed to validate OAuth authorization code:", e);
    return new Response(null, {
      status: 400
    });
  }

  const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
  const googleUserId = claims.sub;
  const username = claims.name;
  
  console.log("Google user info - ID:", googleUserId, "Name:", username);

  const sessionId = generateSecureRandomString();
  console.log("Creating new session:", sessionId, "for Google user:", googleUserId);
  
  await createSession(sessionId, {
    googleUserId,
    username,
    accessToken: tokens.accessToken(),
  });

  console.log("Session created:", sessionId, "for Google user:", googleUserId);

  console.log("Setting session cookie");
  setSessionCookie(event, sessionId, new Date(Date.now() + sessionLifetime));
  console.log("Session cookie set");

  console.log("Session created and cookie set, redirecting to home");
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/"
    }
  });
}
