// backend/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS headers - EVERY REQUEST-এ
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://e-inject.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');
  next();
});

// 2. Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ BACKEND IS RUNNING - Version 4.0',
    time: new Date().toISOString() 
  });
});

app.get('/api/user/is-auth', (req, res) => {
  console.log('User is-auth called');
  res.json({ 
    success: true, 
    message: 'User auth endpoint is working',
    authenticated: false,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/seller/is-auth', (req, res) => {
  console.log('Seller is-auth called');
  res.json({ 
    success: true, 
    message: 'Seller auth endpoint is working',
    authenticated: false,
    timestamp: new Date().toISOString()
  });
});

// 4. Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ test: 'ok', message: 'API test successful' });
});

// 5. Handle OPTIONS requests (CORS preflight)
app.options('*', (req, res) => {
  res.status(200).end();
});

// 6. Start server
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🌐 Root URL: http://localhost:${PORT}/`);
  console.log(`🔗 User Auth: http://localhost:${PORT}/api/user/is-auth`);
});

// 7. Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
