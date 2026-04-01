const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const connection = require('../database');

module.exports = {
  async index(req, res) {
    const products = await Product.findAll({ order: [['id', 'DESC']] });
    return res.json(products);
  },

  async bulkStore(req, res) {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Lista de produtos inválida.' });
    }

    const transaction = await connection.transaction();

    try {
      const results = { created: 0, updated: 0, errors: [] };

      for (let item of products) {
        const { sku, name, stock_quantity, base_price } = item;
        if (!sku || !name || base_price === undefined || stock_quantity === undefined) {
          results.errors.push(`Ignorado: Faltam colunas obrigatórias para SKU: ${sku || '?'}`);
          continue;
        }

        const existingProduct = await Product.findOne({ where: { sku }, transaction });
        
        if (existingProduct) {
          const oldStock = existingProduct.stock_quantity;
          const newStock = oldStock + Number(stock_quantity);
          
          await existingProduct.update({
            name,
            base_price: Number(base_price),
            stock_quantity: newStock
          }, { transaction });

          if (Number(stock_quantity) > 0) {
            await StockMovement.create({
              product_id: existingProduct.id,
              quantity: Number(stock_quantity),
              type: 'IN',
              description: 'Importação CSV: Soma de Estoque'
            }, { transaction });
          }
          results.updated += 1;
        } else {
          const newProduct = await Product.create({
            sku,
            name,
            stock_quantity: Number(stock_quantity),
            base_price: Number(base_price)
          }, { transaction });

          if (Number(stock_quantity) > 0) {
            await StockMovement.create({
              product_id: newProduct.id,
              quantity: Number(stock_quantity),
              type: 'INITIAL',
              description: 'Importação CSV: Cadastro Inicial'
            }, { transaction });
          }
          results.created += 1;
        }
      }

      await transaction.commit();
      return res.json({ success: true, results });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Falha na importação. Nenhuma linha foi salva.' });
    }
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
