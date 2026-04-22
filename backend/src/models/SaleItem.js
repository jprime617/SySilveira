const { Model, DataTypes } = require('sequelize');

class SaleItem extends Model {
  static init(sequelize) {
    super.init({
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price_sold: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_cold: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    }, {
      sequelize,
      tableName: 'sale_items',
    });
  }

  static associate(models) {
    this.belongsTo(models.Sale, { foreignKey: 'sale_id', as: 'sale' });
    this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}

module.exports = SaleItem;
