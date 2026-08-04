import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AppRouter from './router';
import { PATH_ENV } from './configs/pathEnv';
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = PATH_ENV.PORT;

// CORS ต้องระบุ origin ตรงๆ และเปิด credentials เพื่อให้ browser ส่ง cookie ได้
app.use(
  cors({
    origin: PATH_ENV.FRONT_URL || 'http://localhost:3000',
    credentials: true, // สำคัญ: ต้องเปิดเพื่อรับ cookie จาก browser
  }),
);

app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser()); // อ่าน cookie จาก request ได้ผ่าน req.cookies

app.use(AppRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduFlow Backend is running' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
