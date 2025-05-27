# Running the Vending Machine API Docker Container

This document provides instructions for running the Vending Machine API using Docker.

## Prerequisites

- Docker installed on your machine
- Internet connection to pull the image

## Quick Start

Run the following command to start the API:

```bash
docker run -d -p 3000:3000 --name vending-machine bmabdo/vending-machine-api:latest
```

The API will be available at `http://localhost:3000`

## API Endpoints

- GET `http://localhost:3000/api/products` - List all products
- POST `http://localhost:3000/api/coins/insert` - Insert coins
- POST `http://localhost:3000/api/cart/add` - Add product to cart
- GET `http://localhost:3000/api/cart` - View cart
- POST `http://localhost:3000/api/purchase` - Complete purchase
- POST `http://localhost:3000/api/transaction/cancel` - Cancel transaction

## Useful Docker Commands

```bash
# Stop the container
docker stop vending-machine

# Start the container
docker start vending-machine

# Remove the container
docker rm -f vending-machine

# View logs
docker logs vending-machine

# View container status
docker ps
```

## Troubleshooting

If port 3000 is already in use, you can use a different port:

```bash
docker run -d -p 3001:3000 --name vending-machine bmabdo/vending-machine-api:latest
```

Then access the API at `http://localhost:3001`

## Support

If you encounter any issues, please check:
1. Docker is running
2. The port is not already in use
3. You have internet connection to pull the image

For any questions or issues, please contact the developer. 