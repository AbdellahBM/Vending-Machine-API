const { calculateChange, calculateTotalValue, formatChange } = require('../src/utils/changeCalculator');

describe('Change Calculator', () => {
  describe('calculateChange', () => {
    test('should return empty array for zero amount', () => {
      expect(calculateChange(0)).toEqual([]);
    });

    test('should return empty array for negative amount', () => {
      expect(calculateChange(-5)).toEqual([]);
    });

    test('should calculate change for 1.5 MAD', () => {
      const result = calculateChange(1.5);
      expect(result).toEqual([
        { denomination: 1, count: 1 },
        { denomination: 0.5, count: 1 }
      ]);
    });

    test('should calculate change for 7.5 MAD', () => {
      const result = calculateChange(7.5);
      expect(result).toEqual([
        { denomination: 5, count: 1 },
        { denomination: 2, count: 1 },
        { denomination: 0.5, count: 1 }
      ]);
    });

    test('should calculate change for 16 MAD', () => {
      const result = calculateChange(16);
      expect(result).toEqual([
        { denomination: 10, count: 1 },
        { denomination: 5, count: 1 },
        { denomination: 1, count: 1 }
      ]);
    });

    test('should calculate change for 0.5 MAD', () => {
      const result = calculateChange(0.5);
      expect(result).toEqual([
        { denomination: 0.5, count: 1 }
      ]);
    });

    test('should calculate change for 23.5 MAD', () => {
      const result = calculateChange(23.5);
      expect(result).toEqual([
        { denomination: 10, count: 2 },
        { denomination: 2, count: 1 },
        { denomination: 1, count: 1 },
        { denomination: 0.5, count: 1 }
      ]);
    });
  });

  describe('calculateTotalValue', () => {
    test('should return 0 for empty change array', () => {
      expect(calculateTotalValue([])).toBe(0);
    });

    test('should calculate total value correctly', () => {
      const change = [
        { denomination: 10, count: 1 },
        { denomination: 5, count: 1 },
        { denomination: 1, count: 2 },
        { denomination: 0.5, count: 1 }
      ];
      expect(calculateTotalValue(change)).toBe(17.5);
    });
  });

  describe('formatChange', () => {
    test('should return "No change" for empty array', () => {
      expect(formatChange([])).toBe('No change');
    });

    test('should format change correctly', () => {
      const change = [
        { denomination: 10, count: 1 },
        { denomination: 0.5, count: 1 }
      ];
      expect(formatChange(change)).toBe('1 x 10 MAD, 1 x 0.5 MAD');
    });
  });
}); 