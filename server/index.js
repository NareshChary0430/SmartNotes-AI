import express from 'express';
import dotenv from 'dotenv';
import connectDb from './utils/connectDb.js';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000; 

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDb();
});