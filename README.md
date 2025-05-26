# Vending Machine API

A complete RESTful API for an automatic vending machine built with Node.js and Express.js. The API supports coin insertion, product selection, shopping cart management, purchasing with optimized change calculation, and transaction cancellation.

## 🚀 Features

- **Coin Management**: Accept valid MAD (Moroccan Dirham) denominations (0.5, 1, 2, 5, 10)
- **Product Catalog**: Display products with dynamic purchasability based on inserted balance
- **Shopping Cart**: Add/remove multiple products with quantity management
- **Smart Purchasing**: Complete transactions with optimized change calculation
- **Transaction Control**: Cancel transactions and get refunds
- **Comprehensive Testing**: Unit tests and integration tests included
- **Error Handling**: Robust error handling and validation
- **Rate Limiting**: Built-in API rate limiting for security

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [User Scenarios](#user-scenarios)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Assumptions](#assumptions)

## 🛠 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone or extract the project:**
   ```bash
   cd vending-machine-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

4. **The API will be available at:**
   ```
   http://localhost:3000
   ```

## 🔧 Usage

### Quick Start

1. **Check API status:**
   ```bash
   curl http://localhost:3000
   ```

2. **Insert a coin:**
   ```bash
   curl -X POST http://localhost:3000/api/coins/insert \
        -H "Content-Type: application/json" \
        -d '{"value": 5}'
   ```

3. **View available products:**
   ```bash
   curl http://localhost:3000/api/products
   ```

4. **Add product to cart:**
   ```bash
   curl -X POST http://localhost:3000/api/cart/add \
        -H "Content-Type: application/json" \
        -d '{"productId": "soda_cola"}'
   ```

5. **Complete purchase:**
   ```bash
   curl -X POST http://localhost:3000/api/purchase
   ```

## 📡 API Endpoints

### Coin Operations

#### Insert Coin
- **POST** `/api/coins/insert`
- **Body:** `{"value": 5}`
- **Description:** Insert a valid coin denomination
- **Valid denominations:** 0.5, 1, 2, 5, 10 MAD

**Example:**
```bash
curl -X POST http://localhost:3000/api/coins/insert \
     -H "Content-Type: application/json" \
     -d '{"value": 5}'
```

**Response:**
```json
{
  "success": true,
  "message": "Coin of 5 MAD inserted successfully",
  "insertedBalance": 5,
  "coinInserted": 5
}
```

### Product Operations

#### Get All Products
- **GET** `/api/products`
- **Description:** Get all products with purchasability status

**Example:**
```bash
curl http://localhost:3000/api/products
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "soda_cola",
      "name": "Coca Cola",
      "price": 3.5,
      "purchasable": true
    },
    {
      "id": "energy_drink",
      "name": "Energy Drink",
      "price": 6,
      "purchasable": false
    }
  ],
  "insertedBalance": 5
}
```

### Cart Operations

#### Add Product to Cart
- **POST** `/api/cart/add`
- **Body:** `{"productId": "soda_cola", "quantity": 1}`
- **Description:** Add a product to the shopping cart

**Example:**
```bash
curl -X POST http://localhost:3000/api/cart/add \
     -H "Content-Type: application/json" \
     -d '{"productId": "water", "quantity": 2}'
```

#### Remove Product from Cart
- **DELETE** `/api/cart/remove`
- **Body:** `{"productId": "water", "quantity": 1}`
- **Description:** Remove product(s) from cart

#### View Cart
- **GET** `/api/cart`
- **Description:** Get current cart contents and total cost

**Response:**
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "productId": "water",
        "name": "Water Bottle",
        "price": 2,
        "quantity": 2,
        "subtotal": 4
      }
    ],
    "totalCost": 4,
    "itemCount": 2
  },
  "insertedBalance": 10,
  "remainingBalance": 6
}
```

### Transaction Operations

#### Purchase
- **POST** `/api/purchase`
- **Description:** Complete the purchase and get change

**Response:**
```json
{
  "success": true,
  "message": "Purchase completed successfully",
  "purchasedItems": {
    "items": [...],
    "totalCost": 3.5,
    "itemCount": 1
  },
  "totalCost": 3.5,
  "changeAmount": 1.5,
  "change": [
    {"denomination": 1, "count": 1},
    {"denomination": 0.5, "count": 1}
  ],
  "dispensed": [
    {"name": "Coca Cola", "quantity": 1}
  ]
}
```

#### Cancel Transaction
- **POST** `/api/transaction/cancel`
- **Description:** Cancel current transaction and get refund

#### Get Balance
- **GET** `/api/transaction/balance`
- **Description:** Get current transaction balance information

### Admin Operations

#### Reset Machine
- **POST** `/api/admin/reset`
- **Description:** Reset the vending machine to initial state

## 🎯 User Scenarios

### Scenario 1: Simple Purchase with Change

```bash
# 1. Insert 5 MAD
curl -X POST http://localhost:3000/api/coins/insert \
     -d '{"value": 5}' -H "Content-Type: application/json"

# 2. Add Coca Cola (3.5 MAD) to cart
curl -X POST http://localhost:3000/api/cart/add \
     -d '{"productId": "soda_cola"}' -H "Content-Type: application/json"

# 3. Purchase (get 1.5 MAD change)
curl -X POST http://localhost:3000/api/purchase
```

**Expected Result:**
- Product dispensed: Coca Cola
- Change returned: 1 x 1 MAD, 1 x 0.5 MAD

### Scenario 2: Multiple Items Purchase

```bash
# 1. Insert 5 MAD
curl -X POST http://localhost:3000/api/coins/insert \
     -d '{"value": 5}' -H "Content-Type: application/json"

# 2. Insert 2 MAD (total: 7 MAD)
curl -X POST http://localhost:3000/api/coins/insert \
     -d '{"value": 2}' -H "Content-Type: application/json"

# 3. Add Orange Juice (4.5 MAD)
curl -X POST http://localhost:3000/api/cart/add \
     -d '{"productId": "juice_orange"}' -H "Content-Type: application/json"

# 4. Add TikTak (2 MAD)
curl -X POST http://localhost:3000/api/cart/add \
     -d '{"productId": "snack_tiktak"}' -H "Content-Type: application/json"

# 5. Purchase (total: 6.5 MAD, change: 0.5 MAD)
curl -X POST http://localhost:3000/api/purchase
```

**Expected Result:**
- Products dispensed: Orange Juice, TikTak
- Change returned: 1 x 0.5 MAD

### Scenario 3: Transaction Cancellation

```bash
# 1. Insert money and add items
curl -X POST http://localhost:3000/api/coins/insert \
     -d '{"value": 10}' -H "Content-Type: application/json"

curl -X POST http://localhost:3000/api/cart/add \
     -d '{"productId": "water"}' -H "Content-Type: application/json"

# 2. Cancel transaction
curl -X POST http://localhost:3000/api/transaction/cancel
```

**Expected Result:**
- Refund: 1 x 10 MAD
- Cart cleared
- Balance reset

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Categories

1. **Unit Tests:**
   - Change calculator logic
   - VendingMachineService methods
   - Product and Cart models

2. **Integration Tests:**
   - API endpoints
   - Complete user scenarios
   - Error handling

## 📁 Project Structure

```
vending-machine-api/
├── src/
│   ├── controllers/
│   │   └── vendingMachineController.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Coin.js
│   │   └── Cart.js
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   └── VendingMachineService.js
│   └── utils/
│       └── changeCalculator.js
├── tests/
│   ├── changeCalculator.test.js
│   ├── vendingMachineService.test.js
│   └── api.test.js
├── server.js
├── package.json
└── README.md
```

## 🏗 Architecture

### Design Patterns Used

1. **Model-View-Controller (MVC):**
   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Models represent data structures

2. **Service Layer Pattern:**
   - VendingMachineService encapsulates all business logic
   - Clear separation between HTTP handling and business rules

3. **Dependency Injection:**
   - Controllers depend on services
   - Services depend on utilities

### Key Components

- **Models:** Product, Coin, Cart - data representations
- **Services:** VendingMachineService - core business logic
- **Controllers:** HTTP request handlers
- **Routes:** API endpoint definitions
- **Utils:** Reusable utilities (change calculator)

## 📝 Assumptions

1. **Stock Management:**
   - Unlimited stock of all products
   - Unlimited stock of coins for change

2. **Currency:**
   - All amounts in MAD (Moroccan Dirham)
   - Precision limited to 2 decimal places

3. **Session Management:**
   - Single-user system (one transaction at a time)
   - In-memory storage (resets on server restart)

4. **Change Algorithm:**
   - Greedy algorithm is optimal for MAD denominations
   - Machine always has exact change available

5. **Product Catalog:**
   - Predefined products with fixed prices
   - No dynamic pricing or promotions

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS support for web applications
- Error handling without sensitive information exposure

## 🐛 Error Codes

- **400 Bad Request:** Invalid input or insufficient funds
- **404 Not Found:** Product not found or invalid endpoint
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server-side errors

## 🚀 Production Considerations

For production deployment, consider:

1. **Database Integration:** Replace in-memory storage
2. **Authentication:** Add user authentication
3. **Session Management:** Implement proper session handling
4. **Monitoring:** Add logging and monitoring
5. **Scalability:** Consider microservices architecture
6. **Security:** Add HTTPS, input sanitization, and security headers

## 📞 Support

For questions or issues, please check the test files for comprehensive usage examples or review the API endpoint documentation above.

---

**Built with ❤️ for Zenika PFA** 