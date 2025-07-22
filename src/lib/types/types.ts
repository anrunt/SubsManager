import { z } from "zod";

export const sessionDataSchema = z.object({
  googleUserId: z.string(),
  username: z.string(),
  accessToken: z.string()
});

export type UserSessionData = z.infer<typeof sessionDataSchema>;

export type YouTubeSubscription = {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    resourceId: {
      kind: string;
      channelId: string;
    };
    channelId: string;
    thumbnails: {
      default: {
        url: string;
      };
      medium: {
        url: string;
      };
      high: {
        url: string;
      };
    };
  };
};