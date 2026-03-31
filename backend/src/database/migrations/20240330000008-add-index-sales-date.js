module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('sales', ['date'], {
      name: 'sales_date_index',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('sales', 'sales_date_index');
  }
};
