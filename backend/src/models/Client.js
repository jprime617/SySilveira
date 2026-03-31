const { Model, DataTypes } = require('sequelize');

class Client extends Model {
  static init(sequelize) {
    super.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, {
      sequelize,
      tableName: 'clients',
    });
  }

  static associate(models) {
    this.hasMany(models.ClientPrice, { foreignKey: 'client_id', as: 'special_prices' });
    this.hasMany(models.Sale, { foreignKey: 'client_id', as: 'sales' });
  }
}

module.exports = Client;
