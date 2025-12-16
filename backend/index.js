// backend/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// 1. CORS middleware - Fixed syntax
app.use((req, res, next) => {
    // Allow specific origin (not wildcard when using credentials)
    const allowedOrigins = [
        'https://e-inject.vercel.app',
        'https://e-inject.wrrcol.app',
        'http://localhost:3000' // For local development
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// 2. Routes endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend IS RUNNING - Version 4.0',
        time: new Date().toISOString()
    });
});

app.get('/api/user/is-auth', (req, res) => {
    console.log('User is-auth called');
    res.json({
        success: true,
        message: 'user auth endpoint is working',
        authorized: false,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/seller/is-auth', (req, res) => {
    console.log('Seller is-auth called');
    res.json({
        success: true,
        message: 'Seller auth endpoint is working',
        authorized: false,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
