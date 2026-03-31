const { Model, DataTypes } = require('sequelize');

class DeliveryPerson extends Model {
  static init(sequelize) {
    super.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    }, {
      sequelize,
      tableName: 'delivery_people',
    });
  }

  static associate(models) {
    this.hasMany(models.Sale, { foreignKey: 'delivery_person_id', as: 'sales' });
  }
}

module.exports = DeliveryPerson;
