const ConnectSlack = () => {
  const handleConnect = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/slack`;
  };

  return (
    <div>
      <h2>Connect your Slack Workspace</h2>
      <button onClick={handleConnect}>Connect to Slack</button>
    </div>
  );
};

export default ConnectSlack;
