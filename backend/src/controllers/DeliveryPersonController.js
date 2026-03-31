const DeliveryPerson = require('../models/DeliveryPerson');

module.exports = {
  async index(req, res) {
    const deliveryPeople = await DeliveryPerson.findAll({ order: [['name', 'ASC']] });
    return res.json(deliveryPeople);
  },

  async store(req, res) {
    const { name } = req.body;
    const person = await DeliveryPerson.create({ name });
    return res.json(person);
  }
};
