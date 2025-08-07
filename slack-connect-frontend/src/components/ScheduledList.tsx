import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { format } from 'date-fns';

interface ScheduledMessage {
  id: number;
  text: string;
  send_at: string;
  channel_id: string;
}

const team_id = localStorage.getItem('team_id') || '';

const ScheduledList = () => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/scheduled-messages', {
        params: { team_id },
      });
      setMessages(res.data.messages);
    } catch (err) {
      alert('Failed to load scheduled messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this message?')) return;

    try {
      await API.delete(`/auth/scheduled-messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert('Failed to cancel message');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Scheduled Messages</h2>
      {messages.length === 0 ? (
        <p>No scheduled messages</p>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>Text:</strong> {msg.text} <br />
              <strong>Send At:</strong>{' '}
              {format(new Date(msg.send_at), 'yyyy-MM-dd HH:mm')} <br />
              <button onClick={() => handleCancel(msg.id)}>Cancel</button>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScheduledList;
