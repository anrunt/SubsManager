import { deleteSessionCookie, setSessionCookie, validateSession } from "$lib/server/session";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session") ?? null;

  if (sessionId === null) {
    event.locals.user = null;
    return resolve(event);
  }

  const session = await validateSession(sessionId);

  if (session !== null) {
    setSessionCookie(event, sessionId, new Date(session.expiresAt));
  } else {
    deleteSessionCookie(event);
  }

  event.locals.user = session;
  return resolve(event);
}