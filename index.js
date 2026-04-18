require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes/index');
const setupWebSocket = require('./ws/websocket');
const logger = require('./config/logger');
const { apiLimiter } = require('./middlewares/rateLimiter');

connectDB();

const app = express();

// Security Middlewares
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Logging with Morgan and Winston
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

// Rate Limiting for all API routes
app.use(apiLimiter);

// UptimeRobot / Ping Service Endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// System Health Monitor
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json('test ok');
});

// App Routes
app.use('/', routes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: {
      message: message,
      status: status
    }
  });
});

const PORT = process.env.PORT || 4040;
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Initialize WebSocket server on the Express HTTP server
setupWebSocket(server);

// Catch unhandled promising rejections globally
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});
