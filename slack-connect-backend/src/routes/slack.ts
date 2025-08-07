import express from 'express';
import {
  redirectToSlack,
  handleSlackCallback,
} from '../controllers/slackController';
import { sendMessage } from '../controllers/slackController';
import { listChannels } from '../controllers/slackController';
import { scheduleMessage } from '../controllers/slackController';
import {
  listScheduledMessages,
  cancelScheduledMessage,
} from '../controllers/slackController';
import { Token } from '../models/Token';

const router = express.Router();

router.get('/slack', redirectToSlack);
router.get('/slack/callback', handleSlackCallback);
router.post('/send-message', sendMessage);
router.get('/channels', listChannels);
router.post('/schedule-message', scheduleMessage);
router.get('/scheduled-messages', listScheduledMessages);
router.delete('/scheduled-messages/:id', cancelScheduledMessage);
router.get('/debug/tokens', async (_req, res) => {
  const tokens = await Token.findAll();
  res.json(tokens);
});

export default router;
