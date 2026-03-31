const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

module.exports = {
  async index(req, res) {
    const products = await Product.findAll({ order: [['id', 'DESC']] });
    return res.json(products);
  },

  async store(req, res) {
    const { sku, name, stock_quantity, base_price } = req.body;

    const productExists = await Product.findOne({ where: { sku } });
    if (productExists) {
      return res.status(400).json({ error: 'Product SKU already exists' });
    }

    const product = await Product.create({ sku, name, stock_quantity, base_price });

    // Log initial stock movement
    if (stock_quantity > 0) {
      await StockMovement.create({
        product_id: product.id,
        quantity: stock_quantity,
        type: 'INITIAL',
        description: 'Cadastro inicial do produto'
      });
    }

    return res.json(product);
  },

  async update(req, res) {
    const { id } = req.params;
    const { name, stock_quantity, base_price } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const oldStock = product.stock_quantity;
    await product.update({ name, stock_quantity, base_price });

    // Log stock addition if increased
    if (stock_quantity > oldStock) {
      await StockMovement.create({
        product_id: product.id,
        quantity: stock_quantity - oldStock,
        type: 'IN',
        description: 'Reposição manual de estoque'
      });
    }

    return res.json(product);
  }
};
