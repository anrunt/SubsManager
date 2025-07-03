import { Google } from 'arctic';
import dotenv from 'dotenv';

dotenv.config();

export const google = new Google(
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!,
  process.env.REDIRECT_URI!
)

export const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly'
]