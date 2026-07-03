import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AppRouter from './router';
import { PATH_ENV } from './configs/pathEnv';
const morgan = require('morgan');
const bodyParser = require('body-parser');

// const ALLOW_ORIGIN_DOMAINS = [
//   "http://localhost:3000",
//   'http://[::1]'
// ]

dotenv.config();

const app = express();
const PORT = PATH_ENV.PORT;

app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }))
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || ALLOW_ORIGIN_DOMAINS.includes(origin)) {
//       callback(null, true);
//     }

//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true
// }));

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