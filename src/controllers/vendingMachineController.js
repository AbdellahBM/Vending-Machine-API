const VendingMachineService = require('../services/VendingMachineService');

// Create a single instance of the vending machine service
// In a real application, you might want to use session management or database storage
const vendingMachine = new VendingMachineService();

/**
 * Insert a coin into the vending machine
 */
const insertCoin = async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Coin value is required'
      });
    }

    const result = vendingMachine.insertCoin(value);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all products with purchasability status
 */
const getProducts = async (req, res) => {
  try {
    const products = vendingMachine.getProducts();
    res.status(200).json({
      success: true,
      products: products,
      insertedBalance: vendingMachine.getBalance().insertedBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Add a product to the cart
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const result = vendingMachine.addToCart(productId, quantity);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Remove a product from the cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const result = vendingMachine.removeFromCart(productId, quantity);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get current cart contents
 */
const getCart = async (req, res) => {
  try {
    const cart = vendingMachine.getCart();
    res.status(200).json({
      success: true,
      ...cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Purchase items in the cart
 */
const purchase = async (req, res) => {
  try {
    const result = vendingMachine.purchase();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Cancel the current transaction
 */
const cancelTransaction = async (req, res) => {
  try {
    const result = vendingMachine.cancelTransaction();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get current transaction balance
 */
const getBalance = async (req, res) => {
  try {
    const balance = vendingMachine.getBalance();
    res.status(200).json({
      success: true,
      ...balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Reset the vending machine (admin function)
 */
const reset = async (req, res) => {
  try {
    vendingMachine.reset();
    res.status(200).json({
      success: true,
      message: 'Vending machine reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  insertCoin,
  getProducts,
  addToCart,
  removeFromCart,
  getCart,
  purchase,
  cancelTransaction,
  getBalance,
  reset
}; 