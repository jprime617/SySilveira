const Sequelize = require('sequelize');
const dbConfig = require('../../config/database');

// Import models here
const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const ClientPrice = require('../models/ClientPrice');
const DeliveryPerson = require('../models/DeliveryPerson');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const StockMovement = require('../models/StockMovement');

const connection = new Sequelize(dbConfig);

// Init models
const models = [
  User,
  Product,
  Client,
  ClientPrice,
  DeliveryPerson,
  Sale,
  SaleItem,
  StockMovement,
];

models.forEach(model => model.init(connection));
models.forEach(model => model.associate && model.associate(connection.models));

module.exports = connection;
