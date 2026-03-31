module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stock_movements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: false,
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      type: { type: Sequelize.ENUM('INITIAL', 'IN', 'OUT'), allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('stock_movements'); }
};
