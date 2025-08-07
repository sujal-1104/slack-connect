import axios from 'axios';
import { Token } from '../models/Token';

export async function getValidAccessToken(team_id: string): Promise<string | null> {
  const tokenData = await Token.findOne({ where: { team_id } });

  if (!tokenData) return null;

  const now = new Date();

  const expiresAt = tokenData.getDataValue('expires_at');
  if (expiresAt > now) {
    return tokenData.getDataValue('access_token');
  }

  try {
    const response = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.getDataValue('refresh_token'),
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const data = response.data;

    if (!data.ok) {
      console.error('Failed to refresh token:', data);
      return null;
    }

    await Token.update(
      {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000),
      },
      { where: { team_id } }
    );

    return data.access_token;
  } catch (err) {
    console.error('Error refreshing token:', err);
    return null;
  }
}
