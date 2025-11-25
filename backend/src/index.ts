import dotenv from 'dotenv';
// Load environment variables as early as possible so other modules can read them
dotenv.config();

import express from 'express';
import cors from 'cors';
import aiRoute from './routes/ai';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoute);

const PORT = process.env.PORT || 4000;
app.listen(Number(PORT), () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
