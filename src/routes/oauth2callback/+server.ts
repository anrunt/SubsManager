import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { oauth2Client } from "$lib/auth/auth";

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    throw redirect(302, "/googleAuth");
  }

  const { tokens } = await oauth2Client.getToken(`${code}`);

  // Only get tokens and dont setCredentials i need to save the tokens in cookie

  throw redirect(302, "/dashboard");
};
