const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

class User extends Model {
  static init(sequelize) {
    super.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'USER'),
        defaultValue: 'USER',
        allowNull: false,
      }
    }, {
      sequelize,
      tableName: 'users',
    });

    this.addHook('beforeSave', async (user) => {
      // Hash password_hash if it has been modified 
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 8);
      }
    });
  }
}

module.exports = User;
