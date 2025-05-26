# Vending Machine API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required for this demo API.

## Common Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "string (optional)",
  "data": "object (varies by endpoint)"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Endpoints

### 1. Coin Operations

#### Insert Coin
Insert a valid coin denomination into the vending machine.

- **URL:** `/coins/insert`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "value": number  // Valid denominations: 0.5, 1, 2, 5, 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coin of 5 MAD inserted successfully",
  "insertedBalance": 5,
  "coinInserted": 5
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid coin. Valid denominations are: 0.5, 1, 2, 5, 10 MAD",
  "insertedBalance": 0
}
```

### 2. Product Operations

#### Get All Products
Retrieve all available products with their purchasability status.

- **URL:** `/products`
- **Method:** `GET`

**Success Response (200):**
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

### 3. Cart Operations

#### Add Product to Cart
Add a product to the shopping cart.

- **URL:** `/cart/add`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "productId": "string",    // Required: Product ID
  "quantity": number        // Optional: Default is 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coca Cola added to cart",
  "cart": {
    "items": [
      {
        "productId": "soda_cola",
        "name": "Coca Cola",
        "price": 3.5,
        "quantity": 1,
        "subtotal": 3.5
      }
    ],
    "totalCost": 3.5,
    "itemCount": 1
  },
  "insertedBalance": 5
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Insufficient funds. You need 1.5 MAD more to add this item",
  "insertedBalance": 4.5,
  "cartTotal": 0,
  "needed": 1.5
}
```

#### Remove Product from Cart
Remove a product from the shopping cart.

- **URL:** `/cart/remove`
- **Method:** `DELETE`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "productId": "string",    // Required: Product ID
  "quantity": number        // Optional: If not specified, removes all
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product removed from cart",
  "cart": {
    "items": [],
    "totalCost": 0,
    "itemCount": 0
  },
  "insertedBalance": 5
}
```

#### Get Cart Contents
Retrieve current cart contents.

- **URL:** `/cart`
- **Method:** `GET`

**Success Response (200):**
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

### 4. Transaction Operations

#### Purchase Items
Complete the purchase of items in the cart.

- **URL:** `/purchase`
- **Method:** `POST`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Purchase completed successfully",
  "purchasedItems": {
    "items": [
      {
        "productId": "soda_cola",
        "name": "Coca Cola",
        "price": 3.5,
        "quantity": 1,
        "subtotal": 3.5
      }
    ],
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cart is empty. Please add products before purchasing"
}
```

#### Cancel Transaction
Cancel the current transaction and get a refund.

- **URL:** `/transaction/cancel`
- **Method:** `POST`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction cancelled successfully",
  "refundAmount": 7,
  "refundCoins": [
    {"denomination": 5, "count": 1},
    {"denomination": 2, "count": 1}
  ],
  "cancelledCart": {
    "items": [
      {
        "productId": "water",
        "name": "Water Bottle",
        "price": 2,
        "quantity": 1,
        "subtotal": 2
      }
    ],
    "totalCost": 2,
    "itemCount": 1
  }
}
```

#### Get Transaction Balance
Get current balance and transaction information.

- **URL:** `/transaction/balance`
- **Method:** `GET`

**Success Response (200):**
```json
{
  "success": true,
  "insertedBalance": 10,
  "cartTotal": 4,
  "remainingBalance": 6,
  "validCoins": [0.5, 1, 2, 5, 10]
}
```

### 5. Admin Operations

#### Reset Machine
Reset the vending machine to its initial state.

- **URL:** `/admin/reset`
- **Method:** `POST`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vending machine reset successfully"
}
```

## Available Products

| Product ID | Name | Price (MAD) |
|------------|------|-------------|
| soda_cola | Coca Cola | 3.5 |
| soda_pepsi | Pepsi | 3.5 |
| water | Water Bottle | 2.0 |
| juice_orange | Orange Juice | 4.5 |
| snack_chips | Potato Chips | 2.5 |
| snack_tiktak | TikTak | 2.0 |
| chocolate | Chocolate Bar | 3.0 |
| coffee | Coffee | 5.0 |
| tea | Tea | 4.0 |
| energy_drink | Energy Drink | 6.0 |

## Valid Coin Denominations

- 0.5 MAD
- 1 MAD
- 2 MAD
- 5 MAD
- 10 MAD

## Rate Limiting

- **Limit:** 100 requests per IP per 15 minutes
- **Response when exceeded:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Example Workflows

### Simple Purchase
1. `POST /api/coins/insert` with `{"value": 5}`
2. `POST /api/cart/add` with `{"productId": "soda_cola"}`
3. `POST /api/purchase`

### Multiple Items Purchase
1. `POST /api/coins/insert` with `{"value": 5}`
2. `POST /api/coins/insert` with `{"value": 2}`
3. `POST /api/cart/add` with `{"productId": "juice_orange"}`
4. `POST /api/cart/add` with `{"productId": "snack_tiktak"}`
5. `POST /api/purchase`

### Transaction Cancellation
1. Insert coins and add items to cart
2. `POST /api/transaction/cancel`

## Testing the API

You can test the API using:

1. **cURL commands** (see examples in README.md)
2. **Postman** (import the endpoints)
3. **Demo script:** `node demo.js`
4. **Automated tests:** `npm test` 