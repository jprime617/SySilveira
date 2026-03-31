module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sale_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      sale_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sales', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      price_sold: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('sale_items'); }
};
