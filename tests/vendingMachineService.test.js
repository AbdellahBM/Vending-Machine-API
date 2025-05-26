const VendingMachineService = require('../src/services/VendingMachineService');

describe('VendingMachineService', () => {
  let vendingMachine;

  beforeEach(() => {
    vendingMachine = new VendingMachineService();
  });

  describe('insertCoin', () => {
    test('should accept valid coin denominations', () => {
      const validCoins = [0.5, 1, 2, 5, 10];
      
      validCoins.forEach(coin => {
        vendingMachine.reset();
        const result = vendingMachine.insertCoin(coin);
        expect(result.success).toBe(true);
        expect(result.insertedBalance).toBe(coin);
        expect(result.coinInserted).toBe(coin);
      });
    });

    test('should reject invalid coin denominations', () => {
      const invalidCoins = [0.1, 0.25, 3, 4, 7, 20, 50];
      
      invalidCoins.forEach(coin => {
        const result = vendingMachine.insertCoin(coin);
        expect(result.success).toBe(false);
        expect(result.insertedBalance).toBe(0);
      });
    });

    test('should reject negative values', () => {
      const result = vendingMachine.insertCoin(-5);
      expect(result.success).toBe(false);
      expect(result.insertedBalance).toBe(0);
    });

    test('should reject non-numeric values', () => {
      const result = vendingMachine.insertCoin('invalid');
      expect(result.success).toBe(false);
      expect(result.insertedBalance).toBe(0);
    });

    test('should accumulate inserted coins', () => {
      vendingMachine.insertCoin(5);
      const result = vendingMachine.insertCoin(2);
      expect(result.success).toBe(true);
      expect(result.insertedBalance).toBe(7);
    });
  });

  describe('getProducts', () => {
    test('should return all products with purchasability status', () => {
      const products = vendingMachine.getProducts();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
      
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('purchasable');
        expect(typeof product.purchasable).toBe('boolean');
      });
    });

    test('should update purchasability based on inserted balance', () => {
      vendingMachine.insertCoin(5);
      const products = vendingMachine.getProducts();
      
      const affordableProducts = products.filter(p => p.price <= 5);
      const unaffordableProducts = products.filter(p => p.price > 5);
      
      affordableProducts.forEach(product => {
        expect(product.purchasable).toBe(true);
      });
      
      unaffordableProducts.forEach(product => {
        expect(product.purchasable).toBe(false);
      });
    });
  });

  describe('addToCart', () => {
    test('should add valid product to cart when sufficient funds', () => {
      vendingMachine.insertCoin(5);
      const result = vendingMachine.addToCart('water', 1);
      
      expect(result.success).toBe(true);
      expect(result.cart.items).toHaveLength(1);
      expect(result.cart.items[0].productId).toBe('water');
      expect(result.cart.items[0].quantity).toBe(1);
    });

    test('should reject adding product when insufficient funds', () => {
      vendingMachine.insertCoin(1);
      const result = vendingMachine.addToCart('energy_drink', 1); // costs 6 MAD
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('needed');
      expect(result.needed).toBe(5); // 6 - 1 = 5
    });

    test('should reject adding non-existent product', () => {
      vendingMachine.insertCoin(10);
      const result = vendingMachine.addToCart('non_existent', 1);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
    });

    test('should reject invalid quantity', () => {
      vendingMachine.insertCoin(10);
      const result = vendingMachine.addToCart('water', 0);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid quantity. Must be greater than 0');
    });

    test('should add multiple quantities of the same product', () => {
      vendingMachine.insertCoin(10);
      vendingMachine.addToCart('water', 2); // 2 * 2 = 4 MAD
      const result = vendingMachine.addToCart('water', 1); // additional 1 * 2 = 2 MAD
      
      expect(result.success).toBe(true);
      expect(result.cart.items).toHaveLength(1);
      expect(result.cart.items[0].quantity).toBe(3);
      expect(result.cart.totalCost).toBe(6);
    });
  });

  describe('removeFromCart', () => {
    test('should remove product from cart', () => {
      vendingMachine.insertCoin(10);
      vendingMachine.addToCart('water', 2);
      const result = vendingMachine.removeFromCart('water', 1);
      
      expect(result.success).toBe(true);
      expect(result.cart.items[0].quantity).toBe(1);
    });

    test('should remove entire product when quantity not specified', () => {
      vendingMachine.insertCoin(10);
      vendingMachine.addToCart('water', 2);
      const result = vendingMachine.removeFromCart('water');
      
      expect(result.success).toBe(true);
      expect(result.cart.items).toHaveLength(0);
    });

    test('should fail to remove non-existent product', () => {
      const result = vendingMachine.removeFromCart('non_existent');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found in cart');
    });
  });

  describe('purchase', () => {
    test('should complete purchase successfully (Scenario 1)', () => {
      // Scenario 1: Insert 5 MAD, select soda (3.5 MAD), get 1.5 MAD change
      vendingMachine.insertCoin(5);
      vendingMachine.addToCart('soda_cola', 1); // 3.5 MAD
      const result = vendingMachine.purchase();
      
      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(3.5);
      expect(result.changeAmount).toBe(1.5);
      expect(result.change).toEqual([
        { denomination: 1, count: 1 },
        { denomination: 0.5, count: 1 }
      ]);
      expect(result.dispensed).toHaveLength(1);
      expect(result.dispensed[0].name).toBe('Coca Cola');
    });

    test('should complete purchase successfully (Scenario 2)', () => {
      // Scenario 2: Insert 7 MAD, select soda (4.5 MAD) + TikTak (2 MAD), get 0.5 MAD change
      vendingMachine.insertCoin(5);
      vendingMachine.insertCoin(2);
      vendingMachine.addToCart('juice_orange', 1); // 4.5 MAD
      vendingMachine.addToCart('snack_tiktak', 1); // 2 MAD
      const result = vendingMachine.purchase();
      
      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(6.5);
      expect(result.changeAmount).toBe(0.5);
      expect(result.change).toEqual([
        { denomination: 0.5, count: 1 }
      ]);
      expect(result.dispensed).toHaveLength(2);
    });

    test('should fail purchase with empty cart', () => {
      vendingMachine.insertCoin(5);
      const result = vendingMachine.purchase();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty. Please add products before purchasing');
    });

    test('should fail purchase with insufficient funds', () => {
      vendingMachine.insertCoin(2);
      vendingMachine.addToCart('energy_drink', 1); // This should fail at addToCart level
      // But if somehow it gets to cart, purchase should also fail
      vendingMachine.cart.addProduct(vendingMachine.getProduct('energy_drink'), 1);
      const result = vendingMachine.purchase();
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('needed');
    });

    test('should reset machine state after successful purchase', () => {
      vendingMachine.insertCoin(5);
      vendingMachine.addToCart('water', 1);
      vendingMachine.purchase();
      
      expect(vendingMachine.getBalance().insertedBalance).toBe(0);
      expect(vendingMachine.getCart().cart.items).toHaveLength(0);
    });
  });

  describe('cancelTransaction', () => {
    test('should cancel transaction and refund money', () => {
      vendingMachine.insertCoin(5);
      vendingMachine.insertCoin(2);
      vendingMachine.addToCart('water', 1);
      
      const result = vendingMachine.cancelTransaction();
      
      expect(result.success).toBe(true);
      expect(result.refundAmount).toBe(7);
      expect(result.refundCoins).toEqual([
        { denomination: 5, count: 1 },
        { denomination: 2, count: 1 }
      ]);
      expect(vendingMachine.getBalance().insertedBalance).toBe(0);
      expect(vendingMachine.getCart().cart.items).toHaveLength(0);
    });

    test('should handle cancel with no money inserted', () => {
      const result = vendingMachine.cancelTransaction();
      
      expect(result.success).toBe(true);
      expect(result.refundAmount).toBe(0);
      expect(result.refundCoins).toEqual([]);
    });
  });

  describe('getBalance', () => {
    test('should return correct balance information', () => {
      vendingMachine.insertCoin(10);
      vendingMachine.addToCart('water', 2); // 4 MAD total
      
      const balance = vendingMachine.getBalance();
      
      expect(balance.insertedBalance).toBe(10);
      expect(balance.cartTotal).toBe(4);
      expect(balance.remainingBalance).toBe(6);
      expect(balance.validCoins).toEqual([0.5, 1, 2, 5, 10]);
    });
  });

  describe('reset', () => {
    test('should reset machine to initial state', () => {
      vendingMachine.insertCoin(10);
      vendingMachine.addToCart('water', 1);
      
      vendingMachine.reset();
      
      expect(vendingMachine.getBalance().insertedBalance).toBe(0);
      expect(vendingMachine.getCart().cart.items).toHaveLength(0);
    });
  });
}); 