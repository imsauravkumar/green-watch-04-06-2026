import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db.js';

// Import Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import productsRoutes from './routes/products.js';
import contactRoutes from './routes/contact.js';
import communityRoutes from './routes/community.js';
import weatherRoutes from './routes/weather.js';
import adminRoutes from './routes/admin.js';
import analysisRoutes from './routes/analysis.js';
import noticesRoutes from './routes/notices.js';

// Establish Database Connection
connectDB();

const app = express();

// Middlewares
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  'https://green-watch-04-06-2026.vercel.app',
  'https://mesaurav.in',
  'https://www.mesaurav.in',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  ...configuredOrigins
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, Railway health checks)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview/production subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow localhost on any port during development
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Handle preflight for all routes
app.options('*', cors(corsOptions));

// Set body payload limits to support base64 crop image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/notices', noticesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend assets in production mode
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Green Watch API is running in development mode.');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`   Run this command to free it:  npx kill-port ${PORT}`);
    console.error(`   Or find the PID with:         netstat -ano | findstr :${PORT}`);
    console.error(`   Then kill it with:             taskkill /F /PID <PID>\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
