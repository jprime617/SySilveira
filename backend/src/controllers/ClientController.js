const Client = require('../models/Client');
const connection = require('../database');

module.exports = {
  async index(req, res) {
    const clients = await Client.findAll({ order: [['id', 'DESC']] });
    return res.json(clients);
  },

  async bulkStore(req, res) {
    const { clients } = req.body;
    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({ error: 'Lista de clientes inválida.' });
    }

    const transaction = await connection.transaction();
    try {
      const results = { created: 0, updated: 0, errors: [] };

      for (let item of clients) {
        let { name, phone, address } = item;
        
        if (!name) {
          results.errors.push(`Ignorado: Falta nome para cliente${phone ? ' (Tel: '+phone+')' : ''}`);
          continue;
        }

        // Phone might be null but we want it as identifier if provided.
        // If there's no phone, we could search by name. The plan asks to use phone.
        let existingClient = null;
        if (phone && phone.trim() !== '') {
          existingClient = await Client.findOne({ where: { phone }, transaction });
        }

        if (existingClient) {
          await existingClient.update({
            name,
            address: address || existingClient.address
          }, { transaction });
          results.updated += 1;
        } else {
          await Client.create({
            name,
            phone: phone || null,
            address: address || null
          }, { transaction });
          results.created += 1;
        }
      }

      await transaction.commit();
      return res.json({ success: true, results });

    } catch (error) {
      await transaction.rollback();
      console.error('Erro na importação em lote de clientes:', error);
      return res.status(500).json({ error: 'Falha durante importação de clientes. Nada foi salvo.' });
    }
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
