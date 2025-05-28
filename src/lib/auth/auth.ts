import {google} from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// This must be done every time I want to do something with the google api
export const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

export const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly'
]