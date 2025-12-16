const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set exact origin
  if (origin === 'https://e-inject.vercel.app' || origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://e-inject.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  next();
});

// OPTIONS handler
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin === 'https://e-inject.vercel.app') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.status(200).end();
});

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

app.get('/api/user/is-auth', (req, res) => {
  const token = req.cookies.token;
  res.json({ 
    success: !!token, 
    authenticated: !!token,
    message: token ? 'Authenticated' : 'Not authenticated'
  });
});

app.get('/api/seller/is-auth', (req, res) => {
  const token = req.cookies.token;
  res.json({ 
    success: !!token, 
    authenticated: !!token,
    message: token ? 'Seller authenticated' : 'Seller not authenticated'
  });
});

app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple validation
  if (email && password) {
    res.cookie('token', 'jwt-token-here', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { email, name: 'Test User' }
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('✅ CORS configured for exact origin');
});
