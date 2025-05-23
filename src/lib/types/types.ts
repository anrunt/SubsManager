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