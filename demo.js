const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function demonstrateVendingMachine() {
  console.log('🚀 Vending Machine API Demo\n');

  try {
    // Reset the machine first
    console.log('1. Resetting the machine...');
    await axios.post(`${BASE_URL}/admin/reset`);
    console.log('✓ Machine reset successfully\n');

    // Check initial products
    console.log('2. Checking available products...');
    let response = await axios.get(`${BASE_URL}/products`);
    console.log(`✓ Found ${response.data.products.length} products`);
    console.log(`   Current balance: ${response.data.insertedBalance} MAD\n`);

    // Insert coins
    console.log('3. Inserting coins...');
    response = await axios.post(`${BASE_URL}/coins/insert`, { value: 5 });
    console.log(`✓ Inserted 5 MAD. Balance: ${response.data.insertedBalance} MAD`);
    
    response = await axios.post(`${BASE_URL}/coins/insert`, { value: 2 });
    console.log(`✓ Inserted 2 MAD. Balance: ${response.data.insertedBalance} MAD\n`);

    // Check products again (should show purchasability)
    console.log('4. Checking products with money inserted...');
    response = await axios.get(`${BASE_URL}/products`);
    const purchasableProducts = response.data.products.filter(p => p.purchasable);
    console.log(`✓ ${purchasableProducts.length} products are now purchasable:\n`);
    purchasableProducts.forEach(product => {
      console.log(`   - ${product.name}: ${product.price} MAD`);
    });
    console.log('');

    // Add products to cart
    console.log('5. Adding products to cart...');
    response = await axios.post(`${BASE_URL}/cart/add`, { productId: 'juice_orange' });
    console.log(`✓ Added Orange Juice to cart`);
    
    response = await axios.post(`${BASE_URL}/cart/add`, { productId: 'snack_tiktak' });
    console.log(`✓ Added TikTak to cart`);
    
    // Check cart
    response = await axios.get(`${BASE_URL}/cart`);
    console.log(`✓ Cart total: ${response.data.cart.totalCost} MAD`);
    console.log(`   Remaining balance: ${response.data.remainingBalance} MAD\n`);

    // Purchase
    console.log('6. Completing purchase...');
    response = await axios.post(`${BASE_URL}/purchase`);
    console.log(`✓ Purchase completed!`);
    console.log(`   Total cost: ${response.data.totalCost} MAD`);
    console.log(`   Change amount: ${response.data.changeAmount} MAD`);
    console.log(`   Change breakdown:`);
    response.data.change.forEach(coin => {
      console.log(`     - ${coin.count} x ${coin.denomination} MAD`);
    });
    console.log(`   Dispensed items:`);
    response.data.dispensed.forEach(item => {
      console.log(`     - ${item.quantity}x ${item.name}`);
    });

    console.log('\n🎉 Demo completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Add axios as a dependency if not already present
if (require.main === module) {
  console.log('Note: Make sure the server is running (npm start) before running this demo.\n');
  demonstrateVendingMachine();
}

module.exports = { demonstrateVendingMachine }; 