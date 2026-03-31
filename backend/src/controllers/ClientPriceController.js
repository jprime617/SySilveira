const ClientPrice = require('../models/ClientPrice');
const Client = require('../models/Client');
const Product = require('../models/Product');

module.exports = {
  async index(req, res) {
    const { client_id } = req.params;
    const prices = await ClientPrice.findAll({
      where: { client_id },
      include: [{ model: Product, as: 'product' }]
    });
    return res.json(prices);
  },

  async store(req, res) {
    const { client_id } = req.params;
    const { product_id, agreed_price } = req.body;

    const client = await Client.findByPk(client_id);
    const product = await Product.findByPk(product_id);

    if (!client || !product) {
      return res.status(404).json({ error: 'Client or Product not found' });
    }

    let clientPrice = await ClientPrice.findOne({ where: { client_id, product_id } });
    if (clientPrice) {
      clientPrice = await clientPrice.update({ agreed_price });
    } else {
      clientPrice = await ClientPrice.create({ client_id, product_id, agreed_price });
    }

    return res.json(clientPrice);
  }
};
