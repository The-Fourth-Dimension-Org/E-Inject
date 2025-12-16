// backend/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://e-inject.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ E-Inject Backend is WORKING!',
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ test: 'ok', message: 'API is working' });
});

// Handle preflight
app.options('*', (req, res) => {
  res.status(200).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`✅ Root URL: http://localhost:${PORT}/`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
