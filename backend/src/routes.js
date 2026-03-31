const express = require('express');
const routes = express.Router();

const authMiddleware = require('./middlewares/auth');
const adminMiddleware = require('./middlewares/admin');

const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const ProductController = require('./controllers/ProductController');
const ClientController = require('./controllers/ClientController');
const ClientPriceController = require('./controllers/ClientPriceController');
const SaleController = require('./controllers/SaleController');
const DeliveryPersonController = require('./controllers/DeliveryPersonController');
const DeliveryReportController = require('./controllers/DeliveryReportController');

// Health Check
routes.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
routes.post('/users', UserController.store); // Create first admin/user
routes.post('/sessions', SessionController.store);

// Authenticated routes require JWT
routes.use(authMiddleware);

// Clients & Prices
routes.get('/clients', ClientController.index);
routes.post('/clients', ClientController.store);
routes.put('/clients/:id', ClientController.update);

routes.get('/clients/:client_id/prices', ClientPriceController.index);

// Sales
routes.get('/sales', SaleController.index);
routes.post('/sales', SaleController.store);
routes.get('/products', ProductController.index); // Move products index here so users can fetch products to sell

// Delivery / Logistics
routes.get('/delivery_people', DeliveryPersonController.index);
routes.post('/delivery_people', DeliveryPersonController.store);
routes.get('/delivery/reports', DeliveryReportController.index);

// Admins only routes
routes.use(adminMiddleware);
routes.post('/clients/:client_id/prices', ClientPriceController.store);

routes.post('/products', ProductController.store);
routes.put('/products/:id', ProductController.update);

module.exports = routes;
