class Coin {
  static VALID_DENOMINATIONS = [0.5, 1, 2, 5, 10];

  constructor(value) {
    this.value = value;
  }

  /**
   * Validate if the coin value is a valid denomination
   * @param {number} value - Coin value to validate
   * @returns {boolean} Whether the coin is valid
   */
  static isValid(value) {
    if (typeof value !== 'number' || value <= 0) {
      return false;
    }
    return Coin.VALID_DENOMINATIONS.includes(value);
  }

  /**
   * Get all valid coin denominations
   * @returns {Array<number>} Array of valid coin values
   */
  static getValidDenominations() {
    return [...Coin.VALID_DENOMINATIONS];
  }

  /**
   * Get valid denominations sorted in descending order (for change making)
   * @returns {Array<number>} Array of valid coin values in descending order
   */
  static getValidDenominationsDescending() {
    return [...Coin.VALID_DENOMINATIONS].sort((a, b) => b - a);
  }
}

module.exports = Coin; 