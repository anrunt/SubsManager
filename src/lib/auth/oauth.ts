import { Google } from "arctic";
import dotenv from "dotenv";

dotenv.config();

export const google = new Google(
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!,
  process.env.REDIRECT_URI!
);

export const scopes = ["openid", "profile", "https://www.googleapis.com/auth/youtube.readonly"];

export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const bufferTime = 5 * 60; // 5 minutes buffer
  return now >= (expiresAt - bufferTime);
}

export async function refreshAccessTokenWithExpiry(refreshToken: string) {
  const tokens = await google.refreshAccessToken(refreshToken);
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  
  return {
    accessToken: tokens.accessToken(),
    refreshToken: refreshToken, // check if tokens.refreshToken() is needed
    expiresAt
  };
}
