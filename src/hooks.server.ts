import { validateSession } from "$lib/server/session";
import type { Handle } from "@sveltejs/kit";


export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session");
  if (sessionId) {
    const session = await validateSession(sessionId);
    if (session) {
      event.locals.user = {
        googleUserId: session.googleUserId,
        username: session.username,
        accessToken: session.accessToken,
//        refreshToken: session.refreshToken,
        expiresAt: new Date(session.expiresAt)
      };
    }
  }

  return resolve(event);
}