const Coin = require('../models/Coin');

/**
 * Calculate optimal change using greedy algorithm
 * @param {number} amount - Amount of change to calculate
 * @returns {Array<{denomination: number, count: number}>} Array of coin denominations and counts
 */
function calculateChange(amount) {
  if (amount <= 0) {
    return [];
  }

  // Round to 2 decimal places to avoid floating point precision issues
  amount = Math.round(amount * 100) / 100;
  
  const denominations = Coin.getValidDenominationsDescending();
  const change = [];

  for (const denomination of denominations) {
    if (amount >= denomination) {
      const count = Math.floor(amount / denomination);
      if (count > 0) {
        change.push({
          denomination,
          count
        });
        amount = Math.round((amount - (denomination * count)) * 100) / 100;
      }
    }
  }

  return change;
}

/**
 * Calculate total value from change breakdown
 * @param {Array<{denomination: number, count: number}>} change - Change breakdown
 * @returns {number} Total value
 */
function calculateTotalValue(change) {
  return change.reduce((total, coin) => {
    return total + (coin.denomination * coin.count);
  }, 0);
}

/**
 * Format change for display
 * @param {Array<{denomination: number, count: number}>} change - Change breakdown
 * @returns {string} Formatted change string
 */
function formatChange(change) {
  if (change.length === 0) {
    return 'No change';
  }

  return change
    .map(coin => `${coin.count} x ${coin.denomination} MAD`)
    .join(', ');
}

module.exports = {
  calculateChange,
  calculateTotalValue,
  formatChange
}; 