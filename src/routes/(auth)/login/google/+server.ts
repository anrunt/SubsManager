import { generateState, generateCodeVerifier } from "arctic";
import { google, scopes } from "$lib/auth/oauth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, scopes);

  // Add prompt=select_account consent to force account chooser and consent screen
  url.searchParams.set("prompt", "select_account consent");
  // Add access_type=offline to get a refresh token
  url.searchParams.set("access_type", "offline");

  event.cookies.set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });

  event.cookies.set("google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString()
    }
  });
}
