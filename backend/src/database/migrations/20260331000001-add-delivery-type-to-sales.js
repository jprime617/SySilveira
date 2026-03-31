module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales', 'delivery_type', {
      type: Sequelize.ENUM('DELIVERY', 'PICKUP'),
      allowNull: false,
      defaultValue: 'DELIVERY'
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Para remover uma coluna com tipo ENUM nativo do postgres adequadamente
    await queryInterface.removeColumn('sales', 'delivery_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_sales_delivery_type";');
  }
};
