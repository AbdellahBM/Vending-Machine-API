const request = require('supertest');
const app = require('../server');

describe('Vending Machine API', () => {
  
  beforeEach(async () => {
    // Reset the machine before each test
    await request(app)
      .post('/api/admin/reset')
      .expect(200);
  });

  describe('GET /', () => {
    test('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Welcome to the Vending Machine API');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.validCoins).toEqual([0.5, 1, 2, 5, 10]);
    });
  });

  describe('POST /api/coins/insert', () => {
    test('should insert valid coin', async () => {
      const response = await request(app)
        .post('/api/coins/insert')
        .send({ value: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.insertedBalance).toBe(5);
      expect(response.body.coinInserted).toBe(5);
    });

    test('should reject invalid coin', async () => {
      const response = await request(app)
        .post('/api/coins/insert')
        .send({ value: 3 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid coin');
    });

    test('should reject missing coin value', async () => {
      const response = await request(app)
        .post('/api/coins/insert')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Coin value is required');
    });
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBeGreaterThan(0);
      expect(response.body.insertedBalance).toBe(0);

      response.body.products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('purchasable');
        expect(product.purchasable).toBe(false); // No money inserted
      });
    });

    test('should update purchasability when money is inserted', async () => {
      // Insert money first
      await request(app)
        .post('/api/coins/insert')
        .send({ value: 5 })
        .expect(200);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.insertedBalance).toBe(5);
      
      const affordableProducts = response.body.products.filter(p => p.price <= 5);
      const unaffordableProducts = response.body.products.filter(p => p.price > 5);
      
      affordableProducts.forEach(product => {
        expect(product.purchasable).toBe(true);
      });
      
      unaffordableProducts.forEach(product => {
        expect(product.purchasable).toBe(false);
      });
    });
  });

  describe('Cart Operations', () => {
    beforeEach(async () => {
      // Insert some money for cart operations
      await request(app)
        .post('/api/coins/insert')
        .send({ value: 10 })
        .expect(200);
    });

    describe('POST /api/cart/add', () => {
      test('should add product to cart', async () => {
        const response = await request(app)
          .post('/api/cart/add')
          .send({ productId: 'water' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.cart.items).toHaveLength(1);
        expect(response.body.cart.items[0].productId).toBe('water');
        expect(response.body.cart.items[0].quantity).toBe(1);
      });

      test('should reject adding product without sufficient funds', async () => {
        // Reset and insert only 1 MAD
        await request(app).post('/api/admin/reset');
        await request(app)
          .post('/api/coins/insert')
          .send({ value: 1 });

        const response = await request(app)
          .post('/api/cart/add')
          .send({ productId: 'energy_drink' }) // costs 6 MAD
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Insufficient funds');
      });

      test('should reject adding non-existent product', async () => {
        const response = await request(app)
          .post('/api/cart/add')
          .send({ productId: 'non_existent' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product not found');
      });

      test('should reject missing product ID', async () => {
        const response = await request(app)
          .post('/api/cart/add')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product ID is required');
      });
    });

    describe('GET /api/cart', () => {
      test('should return empty cart initially', async () => {
        const response = await request(app)
          .get('/api/cart')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.cart.items).toHaveLength(0);
        expect(response.body.cart.totalCost).toBe(0);
        expect(response.body.insertedBalance).toBe(10);
      });

      test('should return cart with items', async () => {
        // Add items to cart
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 'water' });
        
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 'chocolate' });

        const response = await request(app)
          .get('/api/cart')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.cart.items).toHaveLength(2);
        expect(response.body.cart.totalCost).toBe(5); // 2 + 3
      });
    });

    describe('DELETE /api/cart/remove', () => {
      beforeEach(async () => {
        // Add items to cart for removal tests
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 'water', quantity: 2 });
      });

      test('should remove product from cart', async () => {
        const response = await request(app)
          .delete('/api/cart/remove')
          .send({ productId: 'water', quantity: 1 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.cart.items[0].quantity).toBe(1);
      });

      test('should remove entire product when quantity not specified', async () => {
        const response = await request(app)
          .delete('/api/cart/remove')
          .send({ productId: 'water' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.cart.items).toHaveLength(0);
      });

      test('should fail to remove non-existent product', async () => {
        const response = await request(app)
          .delete('/api/cart/remove')
          .send({ productId: 'non_existent' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product not found in cart');
      });
    });
  });

  describe('Transaction Operations', () => {
    describe('POST /api/purchase', () => {
      test('should complete purchase successfully', async () => {
        // Insert money and add items
        await request(app)
          .post('/api/coins/insert')
          .send({ value: 5 });
        
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 'soda_cola' }); // 3.5 MAD

        const response = await request(app)
          .post('/api/purchase')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.totalCost).toBe(3.5);
        expect(response.body.changeAmount).toBe(1.5);
        expect(response.body.change).toEqual([
          { denomination: 1, count: 1 },
          { denomination: 0.5, count: 1 }
        ]);
        expect(response.body.dispensed).toHaveLength(1);
      });

      test('should fail purchase with empty cart', async () => {
        await request(app)
          .post('/api/coins/insert')
          .send({ value: 5 });

        const response = await request(app)
          .post('/api/purchase')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Cart is empty. Please add products before purchasing');
      });
    });

    describe('POST /api/transaction/cancel', () => {
      test('should cancel transaction and refund money', async () => {
        // Insert money and add items
        await request(app)
          .post('/api/coins/insert')
          .send({ value: 5 });
        
        await request(app)
          .post('/api/coins/insert')
          .send({ value: 2 });
        
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 'water' });

        const response = await request(app)
          .post('/api/transaction/cancel')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.refundAmount).toBe(7);
        expect(response.body.refundCoins).toEqual([
          { denomination: 5, count: 1 },
          { denomination: 2, count: 1 }
        ]);

        // Verify machine is reset
        const balanceResponse = await request(app)
          .get('/api/transaction/balance')
          .expect(200);
        
        expect(balanceResponse.body.insertedBalance).toBe(0);
      });
    });

    describe('GET /api/transaction/balance', () => {
      test('should return current balance information', async () => {
        await request(app)
          .post('/api/coins/insert')
          .send({ value: 10 });
        
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 'water' }); // 2 MAD

        const response = await request(app)
          .get('/api/transaction/balance')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.insertedBalance).toBe(10);
        expect(response.body.cartTotal).toBe(2);
        expect(response.body.remainingBalance).toBe(8);
        expect(response.body.validCoins).toEqual([0.5, 1, 2, 5, 10]);
      });
    });
  });

  describe('Complete User Scenarios', () => {
    test('Scenario 1: Insert 5 MAD, buy soda, get change', async () => {
      // Insert 5 MAD
      const insertResponse = await request(app)
        .post('/api/coins/insert')
        .send({ value: 5 })
        .expect(200);
      expect(insertResponse.body.insertedBalance).toBe(5);

      // Add soda to cart
      const addResponse = await request(app)
        .post('/api/cart/add')
        .send({ productId: 'soda_cola' })
        .expect(200);
      expect(addResponse.body.cart.totalCost).toBe(3.5);

      // Purchase
      const purchaseResponse = await request(app)
        .post('/api/purchase')
        .expect(200);
      
      expect(purchaseResponse.body.success).toBe(true);
      expect(purchaseResponse.body.totalCost).toBe(3.5);
      expect(purchaseResponse.body.changeAmount).toBe(1.5);
      expect(purchaseResponse.body.dispensed[0].name).toBe('Coca Cola');
    });

    test('Scenario 2: Insert 7 MAD, buy multiple items, get change', async () => {
      // Insert 5 MAD + 2 MAD
      await request(app)
        .post('/api/coins/insert')
        .send({ value: 5 });
      
      const insertResponse = await request(app)
        .post('/api/coins/insert')
        .send({ value: 2 });
      expect(insertResponse.body.insertedBalance).toBe(7);

      // Add orange juice (4.5 MAD)
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 'juice_orange' });

      // Add TikTak (2 MAD)
      const addResponse = await request(app)
        .post('/api/cart/add')
        .send({ productId: 'snack_tiktak' });
      expect(addResponse.body.cart.totalCost).toBe(6.5);

      // Purchase
      const purchaseResponse = await request(app)
        .post('/api/purchase')
        .expect(200);
      
      expect(purchaseResponse.body.success).toBe(true);
      expect(purchaseResponse.body.totalCost).toBe(6.5);
      expect(purchaseResponse.body.changeAmount).toBe(0.5);
      expect(purchaseResponse.body.dispensed).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
  });
}); 