const Sale = require('../models/Sale');
const DeliveryPerson = require('../models/DeliveryPerson');
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

    const deliveryPeople = await DeliveryPerson.findAll({
      include: [{
        model: Sale,
        as: 'sales',
        where,
        required: false,
        include: [
          { association: 'client', attributes: ['name', 'address'] },
          { 
             association: 'items', 
             attributes: ['quantity', 'price_sold'],
             include: [{ association: 'product', attributes: ['name'] }]
          }
        ]
      }]
    });

    const report = deliveryPeople.map(person => {
      const totalAmount = person.sales.reduce((acc, sale) => acc + Number(sale.total_price), 0);
      return {
        id: person.id,
        name: person.name,
        total_deliveries: person.sales.length,
        total_amount: totalAmount,
        sales: person.sales.map(s => ({
          id: s.id,
          total: s.total_price,
          date: s.date,
          client_name: s.client.name,
          client_address: s.client.address,
          items: s.items.map(i => ({
             quantity: i.quantity,
             price: i.price_sold,
             product: { name: i.product.name }
          }))
        }))
      };
    });

    return res.json(report);
  }
};
