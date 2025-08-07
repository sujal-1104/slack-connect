import ConnectSlack from '../components/ConnectSlack';
import MessageForm from '../components/MessageForm';
import ScheduledList from '../components/ScheduledList';

const Home = () => {
  return (
    <div>
      <h1>Slack Connect</h1>
      <ConnectSlack />
      <hr />
      <MessageForm />
      <hr />
      <ScheduledList />
    </div>
  );
};

export default Home;
