import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { oauth2Client } from "$lib/auth/auth";

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get("code");

  console.log("Code: ", code);

  if (!code) {
    throw redirect(302, "/googleAuth");
  }

  const { tokens } = await oauth2Client.getToken(`${code}`);

  oauth2Client.setCredentials(tokens);


  throw redirect(302, "/dashboard");
};
