import cron from 'node-cron';
import { ScheduledMessage } from '../models/ScheduledMessage';
import { getValidAccessToken } from '../utils/tokenManager';
import axios from 'axios';

export const startScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    const messages = await ScheduledMessage.findAll({
      where: {
        sent: false,
        send_at: { lte: now },
      },
    });

    for (const message of messages) {
      const token = await getValidAccessToken(message.team_id);
      if (!token) continue;

      try {
        const response = await axios.post(
          'https://slack.com/api/chat.postMessage',
          {
            channel: message.channel_id,
            text: message.text,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.ok) {
          await message.update({ sent: true });
          console.log(`✅ Sent scheduled message: ${message.id}`);
        } else {
          console.warn(`⚠️ Failed to send scheduled message ${message.id}:`, response.data);
        }
      } catch (err) {
        console.error(`❌ Error sending scheduled message ${message.id}:`, err);
      }
    }
  });

  console.log('🕒 Scheduler running every minute');
};
