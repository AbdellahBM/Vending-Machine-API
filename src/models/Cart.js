class Cart {
  constructor() {
    this.items = new Map(); // productId -> { product, quantity }
  }

  /**
   * Add a product to the cart
   * @param {Product} product - Product to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  addProduct(product, quantity = 1) {
    const existingItem = this.items.get(product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.set(product.id, { product, quantity });
    }
  }

  /**
   * Remove a product from the cart
   * @param {string} productId - Product ID to remove
   * @param {number} quantity - Quantity to remove (default: all)
   * @returns {boolean} Whether the product was removed
   */
  removeProduct(productId, quantity = null) {
    const existingItem = this.items.get(productId);
    if (!existingItem) {
      return false;
    }

    if (quantity === null || quantity >= existingItem.quantity) {
      this.items.delete(productId);
    } else {
      existingItem.quantity -= quantity;
    }
    return true;
  }

  /**
   * Get all items in the cart
   * @returns {Array} Array of cart items
   */
  getItems() {
    return Array.from(this.items.values());
  }

  /**
   * Calculate total cost of items in cart
   * @returns {number} Total cost
   */
  getTotalCost() {
    let total = 0;
    for (const item of this.items.values()) {
      total += item.product.price * item.quantity;
    }
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get cart summary with items and total
   * @returns {Object} Cart summary
   */
  getSummary() {
    const items = this.getItems().map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: Math.round(item.product.price * item.quantity * 100) / 100
    }));

    return {
      items,
      totalCost: this.getTotalCost(),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  /**
   * Clear all items from the cart
   */
  clear() {
    this.items.clear();
  }

  /**
   * Check if cart is empty
   * @returns {boolean} Whether the cart is empty
   */
  isEmpty() {
    return this.items.size === 0;
  }
}

module.exports = Cart; 