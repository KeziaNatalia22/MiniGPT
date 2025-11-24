import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoute from './routes/ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoute);

const PORT = process.env.PORT || 4000;
app.listen(Number(PORT), () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
