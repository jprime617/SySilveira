const { Model, DataTypes } = require('sequelize');

class AuditLog extends Model {
  static init(sequelize) {
    super.init({
      user_id: DataTypes.INTEGER,
      action: DataTypes.STRING,
      resource: DataTypes.STRING,
      details: DataTypes.JSON,
    }, {
      sequelize,
      tableName: 'audit_logs',
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

module.exports = AuditLog;
