// server.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongodbConnection = require('./config/mongodb');
// uncomment for seeding 
// require('./config/setupAdmin');

const userRouter = require('./router/userRouter');
// const adminRouter = require('./router/adminRouter');
// const masterRouter = require('./router/masterRouter');
// const transactionRouter = require('./router/transactionRouter');
// const audioVideoRouter = require('./router/audioVideoLogsRouter');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongodbConnection();

// Security: Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Too many requests, please try again later.',
  })
);

// Security: CORS
const allowedOrigins = [
  'http://localhost:3000', // for local development
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

// Security: Helmet
app.use(helmet());
app.set('trust proxy', 1);

// Body parsing
app.use(express.json());
app.use(bodyParser.json());

// Static file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// Routers (uncomment as needed)
app.use('/user', userRouter);
// app.use('/admin', adminRouter);
// app.use('/master', masterRouter);
// app.use('/transactions', transactionRouter);
// app.use('/audiovideo', audioVideoRouter);

// Catch-all 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    status: statusCode,
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
