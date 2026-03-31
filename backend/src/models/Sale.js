const { Model, DataTypes } = require('sequelize');

class Sale extends Model {
  static init(sequelize) {
    super.init({
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      delivery_type: {
        type: DataTypes.ENUM('DELIVERY', 'PICKUP'),
        allowNull: false,
        defaultValue: 'DELIVERY'
      }
    }, {
      sequelize,
      tableName: 'sales',
    });
  }

  static associate(models) {
    this.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
    this.belongsTo(models.DeliveryPerson, { foreignKey: 'delivery_person_id', as: 'delivery_person' });
    this.hasMany(models.SaleItem, { foreignKey: 'sale_id', as: 'items' });
  }
}

module.exports = Sale;
