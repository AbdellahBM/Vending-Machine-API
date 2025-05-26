const Product = require('../models/Product');
const Coin = require('../models/Coin');
const Cart = require('../models/Cart');
const { calculateChange } = require('../utils/changeCalculator');

class VendingMachineService {
  constructor() {
    this.products = this.initializeProducts();
    this.insertedBalance = 0;
    this.cart = new Cart();
  }

  /**
   * Initialize the vending machine with predefined products
   * @returns {Map<string, Product>} Map of products
   */
  initializeProducts() {
    const products = new Map();
    
    // Initialize with sample products
    const productList = [
      new Product('soda_cola', 'Coca Cola', 3.5),
      new Product('soda_pepsi', 'Pepsi', 3.5),
      new Product('water', 'Water Bottle', 2.0),
      new Product('juice_orange', 'Orange Juice', 4.5),
      new Product('snack_chips', 'Potato Chips', 2.5),
      new Product('snack_tiktak', 'TikTak', 2.0),
      new Product('chocolate', 'Chocolate Bar', 3.0),
      new Product('coffee', 'Coffee', 5.0),
      new Product('tea', 'Tea', 4.0),
      new Product('energy_drink', 'Energy Drink', 6.0)
    ];

    productList.forEach(product => {
      products.set(product.id, product);
    });

    return products;
  }

  /**
   * Insert a coin into the vending machine
   * @param {number} coinValue - Value of the coin to insert
   * @returns {Object} Result of coin insertion
   */
  insertCoin(coinValue) {
    if (!Coin.isValid(coinValue)) {
      return {
        success: false,
        message: `Invalid coin. Valid denominations are: ${Coin.getValidDenominations().join(', ')} MAD`,
        insertedBalance: this.insertedBalance
      };
    }

    this.insertedBalance += coinValue;
    this.insertedBalance = Math.round(this.insertedBalance * 100) / 100; // Round to 2 decimal places

    return {
      success: true,
      message: `Coin of ${coinValue} MAD inserted successfully`,
      insertedBalance: this.insertedBalance,
      coinInserted: coinValue
    };
  }

  /**
   * Get all products with their purchasability status
   * @returns {Array} Array of products with purchasability
   */
  getProducts() {
    return Array.from(this.products.values()).map(product => 
      product.toJSON(this.insertedBalance)
    );
  }

  /**
   * Get a specific product by ID
   * @param {string} productId - Product ID
   * @returns {Product|null} Product or null if not found
   */
  getProduct(productId) {
    return this.products.get(productId) || null;
  }

  /**
   * Add a product to the cart
   * @param {string} productId - Product ID to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Object} Result of adding product to cart
   */
  addToCart(productId, quantity = 1) {
    const product = this.getProduct(productId);
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      };
    }

    if (quantity <= 0) {
      return {
        success: false,
        message: 'Invalid quantity. Must be greater than 0'
      };
    }

    // Check if adding this product would exceed the inserted balance
    const currentCartTotal = this.cart.getTotalCost();
    const additionalCost = product.price * quantity;
    const newTotal = currentCartTotal + additionalCost;

    if (newTotal > this.insertedBalance) {
      const needed = newTotal - this.insertedBalance;
      return {
        success: false,
        message: `Insufficient funds. You need ${needed.toFixed(2)} MAD more to add this item`,
        insertedBalance: this.insertedBalance,
        cartTotal: currentCartTotal,
        needed: needed
      };
    }

    this.cart.addProduct(product, quantity);

    return {
      success: true,
      message: `${product.name} added to cart`,
      cart: this.cart.getSummary(),
      insertedBalance: this.insertedBalance
    };
  }

  /**
   * Remove a product from the cart
   * @param {string} productId - Product ID to remove
   * @param {number} quantity - Quantity to remove (default: all)
   * @returns {Object} Result of removing product from cart
   */
  removeFromCart(productId, quantity = null) {
    const removed = this.cart.removeProduct(productId, quantity);
    
    if (!removed) {
      return {
        success: false,
        message: 'Product not found in cart'
      };
    }

    return {
      success: true,
      message: 'Product removed from cart',
      cart: this.cart.getSummary(),
      insertedBalance: this.insertedBalance
    };
  }

  /**
   * Get current cart contents
   * @returns {Object} Cart summary with inserted balance
   */
  getCart() {
    return {
      cart: this.cart.getSummary(),
      insertedBalance: this.insertedBalance,
      remainingBalance: this.insertedBalance - this.cart.getTotalCost()
    };
  }

  /**
   * Process purchase of items in cart
   * @returns {Object} Result of purchase transaction
   */
  purchase() {
    if (this.cart.isEmpty()) {
      return {
        success: false,
        message: 'Cart is empty. Please add products before purchasing'
      };
    }

    const cartTotal = this.cart.getTotalCost();
    
    if (cartTotal > this.insertedBalance) {
      const needed = cartTotal - this.insertedBalance;
      return {
        success: false,
        message: `Insufficient funds. You need ${needed.toFixed(2)} MAD more`,
        insertedBalance: this.insertedBalance,
        cartTotal: cartTotal,
        needed: needed
      };
    }

    // Calculate change
    const changeAmount = this.insertedBalance - cartTotal;
    const change = calculateChange(changeAmount);
    const purchasedItems = this.cart.getSummary();

    // Reset for next transaction
    this.insertedBalance = 0;
    this.cart.clear();

    return {
      success: true,
      message: 'Purchase completed successfully',
      purchasedItems: purchasedItems,
      totalCost: cartTotal,
      changeAmount: changeAmount,
      change: change,
      dispensed: purchasedItems.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    };
  }

  /**
   * Cancel current transaction and refund inserted money
   * @returns {Object} Result of transaction cancellation
   */
  cancelTransaction() {
    const refundAmount = this.insertedBalance;
    const refundCoins = calculateChange(refundAmount);
    const cartSummary = this.cart.getSummary();

    // Reset for next transaction
    this.insertedBalance = 0;
    this.cart.clear();

    return {
      success: true,
      message: 'Transaction cancelled successfully',
      refundAmount: refundAmount,
      refundCoins: refundCoins,
      cancelledCart: cartSummary
    };
  }

  /**
   * Get current transaction balance
   * @returns {Object} Current balance information
   */
  getBalance() {
    return {
      insertedBalance: this.insertedBalance,
      cartTotal: this.cart.getTotalCost(),
      remainingBalance: this.insertedBalance - this.cart.getTotalCost(),
      validCoins: Coin.getValidDenominations()
    };
  }

  /**
   * Reset the vending machine to initial state
   */
  reset() {
    this.insertedBalance = 0;
    this.cart.clear();
  }
}

module.exports = VendingMachineService; 