module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      client_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      delivery_person_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'delivery_people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      total_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('sales'); }
};
