const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api', limiter);

// Routes
app.use('/api', apiRoutes);

// API info endpoint
app.get('/api-info', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Vending Machine API',
    version: '1.0.0',
    endpoints: {
      'POST /api/coins/insert': 'Insert a coin into the machine',
      'GET /api/products': 'Get all products with purchasability status',
      'POST /api/cart/add': 'Add a product to the cart',
      'DELETE /api/cart/remove': 'Remove a product from the cart',
      'GET /api/cart': 'Get current cart contents',
      'POST /api/purchase': 'Purchase items in the cart',
      'POST /api/transaction/cancel': 'Cancel current transaction',
      'GET /api/transaction/balance': 'Get current balance',
      'POST /api/admin/reset': 'Reset the vending machine'
    },
    validCoins: [0.5, 1, 2, 5, 10],
    currency: 'MAD'
  });
});

// Root endpoint - serve the web interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  Vending Machine API Started Successfully
  ----------------------------------------
  Server running on port: ${PORT}
  
  Available Access Points:
  - Web Interface: http://localhost:${PORT}
  - API Base URL: http://localhost:${PORT}/api
  - API Documentation: http://localhost:${PORT}/api-info
  
  The system is now ready to accept requests.
  `);
});

module.exports = app; 