// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===

// CORS configuration
app.use(cors({
  origin: [
    'https://drakor-gateway.your-username.workers.dev', // Cloudflare Worker URL
    'http://localhost:3000', // Local development
    'https://your-app.vercel.app', // Vercel direct access
    '*' // Allow all for now, bisa dikurangi later
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Cloudflare-Worker']
}));

// Rate limiting untuk prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit untuk Cloudflare Worker
    return req.headers['x-cloudflare-worker'] === 'drakor-gateway/1.0';
  }
});

app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware untuk log requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const isCloudflare = req.headers['x-cloudflare-worker'] ? '☁️ Cloudflare' : '🌐 Direct';
  
  console.log(`[${timestamp}] ${isCloudflare} - ${req.method} ${req.url} - IP: ${clientIP} - UA: ${userAgent.substring(0, 50)}`);
  
  // Tambah response headers untuk info
  res.set('X-API-Version', '1.0.0');
  res.set('X-Response-Time', Date.now());
  
  next();
});

// === ROUTES ===

// Import routes
const drakorkitaRoutes = require('./src/routes/drakorkita');

// Health check endpoint (penting untuk Cloudflare Worker)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Drakor API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    request_source: req.headers['x-cloudflare-worker'] ? 'cloudflare-worker' : 'direct'
  });
});

// Ping endpoint untuk keep-alive
app.get('/ping', (req, res) => {
  res.json({ 
    pong: true,
    timestamp: new Date().toISOString()
  });
});

// Main routes
app.use('/api/drakorkita', drakorkitaRoutes);

// Home route dengan info lengkap
app.get('/', (req, res) => {
  const isCloudflare = req.headers['x-cloudflare-worker'] ? ' (via Cloudflare Worker)' : '';
  
  res.json({
    message: 'Drakorkita Scraper API' + isCloudflare,
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      series: '/api/drakorkita/series',
      movies: '/api/drakorkita/movie',
      search: '/api/drakorkita/search?s=keyword',
      detail: '/api/drakorkita/detail/:endpoint',
      genres: '/api/drakorkita/genres',
      health: '/health',
      ping: '/ping'
    },
    usage: {
      note: 'All endpoints support CORS',
      example: 'GET /api/drakorkita/series?page=1',
      pagination: 'Use ?page= parameter for pagination'
    },
    limits: {
      rate_limit: '100 requests per 15 minutes',
      cache: 'Responses are cached by Cloudflare'
    }
  });
});

// === ERROR HANDLING ===

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requested: req.originalUrl,
    available_endpoints: [
      '/api/drakorkita/series',
      '/api/drakorkita/movie',
      '/api/drakorkita/search',
      '/api/drakorkita/detail/:endpoint',
      '/api/drakorkita/genres',
      '/health',
      '/'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Error response untuk Cloudflare Worker
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    request_id: req.headers['x-request-id'] || Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      url: req.url,
      method: req.method,
      headers: req.headers
    };
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// === SERVER START ===

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  =========================================
  ✅ Drakor API Server Started!
  📡 Port: ${PORT}
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
  🕐 Time: ${new Date().toISOString()}
  =========================================
  
  Available Routes:
  🔹 Home: http://localhost:${PORT}/
  🔹 Health: http://localhost:${PORT}/health
  🔹 Series: http://localhost:${PORT}/api/drakorkita/series
  🔹 Movies: http://localhost:${PORT}/api/drakorkita/movie
  🔹 Search: http://localhost:${PORT}/api/drakorkita/search?s=query
  🔹 Detail: http://localhost:${PORT}/api/drakorkita/detail/:endpoint
  🔹 Genres: http://localhost:${PORT}/api/drakorkita/genres
  
  Cloudflare Worker Integration:
  🔹 Worker should proxy to: http://localhost:${PORT}
  🔹 Add header: X-Cloudflare-Worker: drakor-gateway/1.0
  =========================================
  `);
});

module.exports = app;