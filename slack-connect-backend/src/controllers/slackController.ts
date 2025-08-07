import type { Request, Response } from 'express';
import axios from 'axios';
import { Token } from '../models/Token';
import { getValidAccessToken } from '../utils/tokenManager';
import { ScheduledMessage } from '../models/ScheduledMessage';

export const redirectToSlack = (req: Request, res: Response) => {
  const redirectUri = encodeURIComponent(process.env.SLACK_REDIRECT_URI!);
  const clientId = process.env.SLACK_CLIENT_ID!;
  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,channels:read,channels:join&user_scope=&redirect_uri=${redirectUri}`;

  res.redirect(slackAuthUrl);
};

export const handleSlackCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const response = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const data = response.data;

    if (!data.ok) {
      console.error('Slack OAuth error:', data);
      return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      team: { id: team_id },
    } = data;

    await Token.upsert({
      team_id,
      access_token,
      refresh_token,
      expires_at: new Date(Date.now() + expires_in * 1000),
    });

    console.log(` Slack OAuth success for team ${team_id}`);

   return res.json({ success: true, team_id });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}?error=callback_exception`);
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { team_id, channel_id, text } = req.body;

  if (!team_id || !channel_id || !text) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const token = await getValidAccessToken(team_id);
    if (!token) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const result = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: channel_id,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = result.data;
    if (!data.ok) {
      return res.status(400).json({ error: 'Slack API error', detail: data });
    }

    res.json({ success: true, message_ts: data.ts });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listChannels = async (req: Request, res: Response) => {
  const { team_id } = req.query;

  if (!team_id || typeof team_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid team_id' });
  }

  try {
    const token = await getValidAccessToken(team_id);
    if (!token) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const response = await axios.get('https://slack.com/api/conversations.list', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;

    if (!data.ok) {
      return res.status(400).json({ error: 'Slack API error', detail: data });
    }

    const channels = data.channels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
    }));

    res.json({ channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const scheduleMessage = async (req: Request, res: Response) => {
  const { team_id, channel_id, text, send_at } = req.body;

  if (!team_id || !channel_id || !text || !send_at) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const sendAtDate = new Date(send_at);
    if (sendAtDate <= new Date()) {
      return res.status(400).json({ error: 'send_at must be a future time' });
    }

    const scheduled = await ScheduledMessage.create({
      team_id,
      channel_id,
      text,
      send_at: sendAtDate,
    });

    res.json({ success: true, scheduled });
  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listScheduledMessages = async (req: Request, res: Response) => {
  const { team_id } = req.query;

  if (!team_id || typeof team_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid team_id' });
  }

  try {
    const messages = await ScheduledMessage.findAll({
      where: {
        team_id,
        sent: false,
      },
      order: [['send_at', 'ASC']],
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelScheduledMessage = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const message = await ScheduledMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sent) {
      return res.status(400).json({ error: 'Cannot cancel a message that has already been sent' });
    }

    await message.destroy();
    res.json({ success: true, message: 'Scheduled message cancelled' });
  } catch (error) {
    console.error('Error cancelling message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
