const { Model, DataTypes } = require('sequelize');

class ClientPrice extends Model {
  static init(sequelize) {
    super.init({
      agreed_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      }
    }, {
      sequelize,
      tableName: 'client_prices',
    });
  }

  static associate(models) {
    this.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
    this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}

module.exports = ClientPrice;
