import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import slackRoutes from './routes/slack';
import { sequelize } from './models';
import { startScheduler } from './services/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/auth', slackRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
startScheduler();
