const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const ClientPrice = require('../models/ClientPrice');
const DeliveryPerson = require('../models/DeliveryPerson');
const connection = require('../database');
const { Op } = require('sequelize');

module.exports = {
  async index(req, res) {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await Sale.findAll({
      where,
      include: [
        { association: 'client', attributes: ['name'] },
        { association: 'delivery_person', attributes: ['name'] },
        { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'sku'] }] }
      ],
      order: [['date', 'DESC']]
    });
    return res.json(sales);
  },

  async store(req, res) {
    const { client_id, delivery_person_id, items, delivery_type, frontend_total } = req.body; // items: [{product_id, quantity}]

    const transaction = await connection.transaction();

    try {
      let total_price = 0;
      const saleItemsData = [];

      for (let item of items) {
        const product = await Product.findByPk(item.product_id, { transaction });
        if (!product) throw new Error(`Product ${item.product_id} not found`);
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for Product ${product.name}`);
        }

        // Resolve price (Override vs ClientPrice vs Base Price)
        let price_sold;
        if (item.override_price !== undefined && item.override_price !== null) {
          price_sold = item.override_price;
        } else {
          const clientPrice = await ClientPrice.findOne({
            where: { client_id, product_id: item.product_id },
            transaction
          });
          price_sold = clientPrice ? clientPrice.agreed_price : product.base_price;
        }

        total_price += Number(price_sold) * item.quantity;

        // Subtract stock
        await product.update({ stock_quantity: product.stock_quantity - item.quantity }, { transaction });

        saleItemsData.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_sold,
        });
      }

      // Validação Estrita de Preços Front vs Backend
      if (frontend_total !== undefined && Number(total_price).toFixed(2) !== Number(frontend_total).toFixed(2)) {
         throw new Error(`Divergência de valores detectada. Frontend enviou R$ ${Number(frontend_total).toFixed(2)} mas o Backend validou R$ ${Number(total_price).toFixed(2)}.`);
      }

      const sale = await Sale.create({
        client_id,
        delivery_person_id: delivery_type === 'PICKUP' ? null : delivery_person_id,
        delivery_type: delivery_type || 'DELIVERY',
        total_price,
        date: new Date(),
      }, { transaction });

      const itemsToCreate = saleItemsData.map(i => ({ ...i, sale_id: sale.id }));
      await SaleItem.bulkCreate(itemsToCreate, { transaction });

      await transaction.commit();

      return res.json(sale);
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { client_id, delivery_person_id, items, delivery_type, frontend_total } = req.body;

    const transaction = await connection.transaction();

    try {
      const sale = await Sale.findByPk(id, {
        include: [{ association: 'items' }],
        transaction
      });

      if (!sale) {
        throw new Error('Venda não encontrada');
      }

      // Step 1: Restore stock from old items
      if (sale.items && sale.items.length > 0) {
        for (let oldItem of sale.items) {
          const product = await Product.findByPk(oldItem.product_id, { transaction });
          if (product) {
            await product.update(
              { stock_quantity: product.stock_quantity + oldItem.quantity },
              { transaction }
            );
          }
        }
        // Destroy old items
        await SaleItem.destroy({ where: { sale_id: sale.id }, transaction });
      }

      // Step 2: Calculate new total and deduct new stock (Exactly like store)
      let total_price = 0;
      const saleItemsData = [];

      for (let item of items) {
        const product = await Product.findByPk(item.product_id, { transaction });
        if (!product) throw new Error(`Product ${item.product_id} not found`);
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Estoque insuficiente para o Produto: ${product.name}`);
        }

        // Resolve price
        let price_sold;
        if (item.override_price !== undefined && item.override_price !== null) {
          price_sold = item.override_price;
        } else {
          const clientPrice = await ClientPrice.findOne({
            where: { client_id, product_id: item.product_id },
            transaction
          });
          price_sold = clientPrice ? clientPrice.agreed_price : product.base_price;
        }

        total_price += Number(price_sold) * item.quantity;

        // Subtract stock for new calculation
        await product.update(
          { stock_quantity: product.stock_quantity - item.quantity },
          { transaction }
        );

        saleItemsData.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_sold,
          sale_id: sale.id // link directly to existing sale
        });
      }

      // Update the Sale header
      await sale.update({
        client_id,
        delivery_person_id: delivery_type === 'PICKUP' ? null : delivery_person_id,
        delivery_type: delivery_type || 'DELIVERY',
        total_price
      }, { transaction });

      // Create new items
      await SaleItem.bulkCreate(saleItemsData, { transaction });

      await transaction.commit();

      // Return updated sale
      const updatedSale = await Sale.findByPk(sale.id, {
        include: [
          { association: 'client', attributes: ['name'] },
          { association: 'delivery_person', attributes: ['name'] },
          { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'sku'] }] }
        ]
      });

      return res.json(updatedSale);
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.message });
    }
  }
};
