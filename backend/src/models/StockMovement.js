const { Model, DataTypes } = require('sequelize');

class StockMovement extends Model {
  static init(sequelize) {
    super.init({
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      type: DataTypes.ENUM('INITIAL', 'IN', 'OUT'),
      description: DataTypes.STRING,
    }, {
      sequelize,
      tableName: 'stock_movements',
    });
  }

  static associate(models) {
    this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}

module.exports = StockMovement;
