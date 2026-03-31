const Client = require('../models/Client');

module.exports = {
  async index(req, res) {
    const clients = await Client.findAll({ order: [['id', 'DESC']] });
    return res.json(clients);
  },

  async store(req, res) {
    const { name, address, phone } = req.body;

    const client = await Client.create({ name, address, phone });
    return res.json(client);
  },

  async update(req, res) {
    const { id } = req.params;
    const { name, address, phone } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({ name, address, phone });
    return res.json(client);
  }
};
