const { Model, DataTypes } = require('sequelize');

class Product extends Model {
  static init(sequelize) {
    super.init({
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      }
    }, {
      sequelize,
      tableName: 'products',
    });
  }

  static associate(models) {
    this.hasMany(models.ClientPrice, { foreignKey: 'product_id', as: 'special_prices' });
    this.hasMany(models.SaleItem, { foreignKey: 'product_id', as: 'sale_items' });
    this.hasMany(models.StockMovement, { foreignKey: 'product_id', as: 'stock_movements' });
  }
}

module.exports = Product;
