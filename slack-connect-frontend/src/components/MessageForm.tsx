import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { formatISO } from 'date-fns';

interface Channel {
  id: string;
  name: string;
}

const team_id = localStorage.getItem('team_id') || '';

const MessageForm = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState('');
  const [text, setText] = useState('');
  const [sendAt, setSendAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const team_id = localStorage.getItem('team_id') || '';

    if (!team_id) {
      console.error('Missing team_id in localStorage');
      return;
    }

    const fetchChannels = async () => {
      try {
        const response = await fetch(`http://localhost:5000/channels?team_id=${team_id}`);
        const data = await response.json();

        if (data.channels) {
          setChannels(data.channels);
        } else {
          console.error('Failed to load channels:', data);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const handleSend = async (scheduled: boolean) => {
    if (!channelId || !text) return alert('Please fill all fields');

    try {
      setLoading(true);
      const payload = {
        team_id,
        channel_id: channelId,
        text,
        ...(scheduled ? { send_at: sendAt } : {}),
      };

      const endpoint = scheduled ? '/auth/schedule-message' : '/auth/send-message';

      await API.post(endpoint, payload);
      alert(scheduled ? 'Message scheduled!' : 'Message sent!');
      setText('');
      setSendAt('');
    } catch (err) {
      alert('Failed to send/schedule message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Send or Schedule Message</h2>

      <label>
        Channel:
        <select value={channelId} onChange={(e) => setChannelId(e.target.value)}>
          <option value="">-- Select Channel --</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              #{c.name}
            </option>
          ))}
        </select>
      </label>

      <br />

      <label>
        Message:
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </label>

      <br />

      <label>
        Schedule Time:
        <input
          type="datetime-local"
          value={sendAt}
          onChange={(e) => setSendAt(e.target.value)}
          min={formatISO(new Date()).slice(0, 16)}
        />
      </label>

      <br />

      <button disabled={loading} onClick={() => handleSend(false)}>
        Send Now
      </button>
      <button disabled={loading || !sendAt} onClick={() => handleSend(true)}>
        Schedule
      </button>
    </div>
  );
};

export default MessageForm;
