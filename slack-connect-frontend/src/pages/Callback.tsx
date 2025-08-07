import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      console.error('No code in callback URL');
      navigate('/');
      return;
    }

    const fetchTokens = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/callback?code=${code}`);
        const data = await response.json();

        console.log("OAuth Response:", data);

        if (data.team_id) {
          localStorage.setItem('team_id', data.team_id);
          navigate('/');
        } else {
          console.error('OAuth response missing team_id');
          navigate('/');
        }
      } catch (error) {
        console.error('Error during token exchange:', error);
        navigate('/');
      }
    };

    fetchTokens();
  }, [navigate]);

  return <div>Connecting to Slack...</div>;
};

export default Callback;
