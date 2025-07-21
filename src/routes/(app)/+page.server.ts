import { deleteSession, deleteSessionCookie } from "$lib/server/session";
import type { Actions } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.user) {
      throw new Error("User not found");
    }

    const sessionId = event.cookies.get("session");
    
    if (sessionId) {
      await deleteSession(sessionId, event.locals.user.googleUserId);
      deleteSessionCookie(event);
    } else {
      throw new Error("Session not found, please log in again");
    }

    throw redirect(302, "/");
  },
};
