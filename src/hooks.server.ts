import { deleteSessionCookie, setSessionCookie, validateSession } from "$lib/server/session";
import { sessionLifetime } from "$lib/helper/helper";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const auth: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session") ?? null;

  if (sessionId === null) {
    event.locals.user = null;
    return resolve(event);
  }

  const session = await validateSession(sessionId);

  if (session !== null) {
    setSessionCookie(event, sessionId, new Date(Date.now() + sessionLifetime));
  } else {
    deleteSessionCookie(event);
  }

  event.locals.user = session;
  return resolve(event);
};

// When user is logged in, redirect to dashboard always
export const protectedRoutes: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/dashboard")) {
    if (event.locals.user === null) {
      throw redirect(307, "/login");
    }
  }

  if (event.url.pathname.startsWith("/login")) {
    if (event.locals.user !== null) {
      throw redirect(307, "/");
    }
  }
  return resolve(event);
};

export const handle = sequence(auth, protectedRoutes);