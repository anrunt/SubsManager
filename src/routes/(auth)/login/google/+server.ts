import { generateState, generateCodeVerifier } from "arctic";
import { google, scopes } from "$lib/auth/oauth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, scopes);

  // Add prompt=select_account to force account chooser in all browsers
  url.searchParams.set("prompt", "select_account");

  console.log("Ustawiam cookie google_oauth_state");
  event.cookies.set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });

  console.log("Ustawiam cookie google_code_verifier");
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
