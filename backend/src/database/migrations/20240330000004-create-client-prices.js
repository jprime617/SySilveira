module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('client_prices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      client_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      agreed_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('client_prices'); }
};
