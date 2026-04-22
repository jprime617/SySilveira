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
        // We also check by lowercase name to avoid unique constraint errors.
        const cleanName = name.trim();
        let existingClient = null;

        if (phone && phone.trim() !== '') {
          existingClient = await Client.findOne({ where: { phone }, transaction });
        }

        if (!existingClient) {
          existingClient = await Client.findOne({ 
            where: Sequelize.where(Sequelize.fn('lower', Sequelize.fn('trim', Sequelize.col('name'))), cleanName.toLowerCase()), 
            transaction 
          });
        }

        if (existingClient) {
          await existingClient.update({
            name: cleanName,
            address: address || existingClient.address,
            phone: phone || existingClient.phone
          }, { transaction });
          results.updated += 1;
        } else {
          await Client.create({
            name: cleanName,
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
    const { Sequelize } = require('sequelize');

    const cleanName = name.trim();
    const existing = await Client.findOne({
       where: Sequelize.where(Sequelize.fn('lower', Sequelize.fn('trim', Sequelize.col('name'))), cleanName.toLowerCase())
    });

    if (existing) {
       return res.status(400).json({ error: 'Um cliente com este nome já existe.' });
    }

    const client = await Client.create({ name: cleanName, address, phone });
    return res.json(client);
  },

  async update(req, res) {
    const { id } = req.params;
    const { name, address, phone } = req.body;
    const { Sequelize, Op } = require('sequelize');

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const cleanName = name.trim();
    const existing = await Client.findOne({
       where: {
         id: { [Op.ne]: id },
         [Op.and]: Sequelize.where(Sequelize.fn('lower', Sequelize.fn('trim', Sequelize.col('name'))), cleanName.toLowerCase())
       }
    });

    if (existing) {
       return res.status(400).json({ error: 'Outro cliente com este nome já existe.' });
    }

    await client.update({ name: cleanName, address, phone });
    return res.json(client);
  },

  async destroy(req, res) {
    const { id } = req.params;
    try {
      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      
      await client.destroy();
      return res.status(204).send();
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'Este cliente possui compras antigas. Por segurança financeira, ele não pode ser apagado permanentemente.' });
      }
      return res.status(500).json({ error: error.message });
    }
  }
};
