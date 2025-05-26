const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendingMachineController');

// Coin operations
router.post('/coins/insert', controller.insertCoin);

// Product operations
router.get('/products', controller.getProducts);

// Cart operations
router.post('/cart/add', controller.addToCart);
router.delete('/cart/remove', controller.removeFromCart);
router.get('/cart', controller.getCart);

// Transaction operations
router.post('/purchase', controller.purchase);
router.post('/transaction/cancel', controller.cancelTransaction);
router.get('/transaction/balance', controller.getBalance);

// Admin operations
router.post('/admin/reset', controller.reset);

module.exports = router; 