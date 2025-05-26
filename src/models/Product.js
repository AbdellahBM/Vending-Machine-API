class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  /**
   * Check if the product is purchasable with the given balance
   * @param {number} balance - Current inserted balance
   * @returns {boolean} Whether the product can be purchased
   */
  isPurchasable(balance) {
    return balance >= this.price;
  }

  /**
   * Get product information with purchasability status
   * @param {number} balance - Current inserted balance
   * @returns {Object} Product information with purchasability status
   */
  toJSON(balance = 0) {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      purchasable: this.isPurchasable(balance)
    };
  }
}

module.exports = Product; 