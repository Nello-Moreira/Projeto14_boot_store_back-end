import '../setup/dotenvSetup.js';
import express from 'express';
import cors from 'cors';

import status from './controllers/status.js';
import categories from './controllers/categories.js';
import categoryProducts from './controllers/categoryProducts.js';
import allProducts from './controllers/allProducts.js';
import product from './controllers/product.js';
import cart from './controllers/cart.js';

const server = express();
server.use(cors());
server.use(express.json());

server.get(status.route, status.getStatus);

server.get(categories.route, categories.getAllCategories);

server.get(categoryProducts.route, categoryProducts.getCategoryProducts);

server.get(allProducts.route, allProducts.getProducts);

server.get(product.route, product.getProductById);

server.post(cart.route, cart.insertProduct);

server.get(cart.route, cart.getCart);

export default server;
