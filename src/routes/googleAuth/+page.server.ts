import type { PageServerLoad } from "./$types";
import { oauth2Client, scopes } from "$lib/auth/auth";

export const load: PageServerLoad = async () => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  return {
    url: url
  };
}
