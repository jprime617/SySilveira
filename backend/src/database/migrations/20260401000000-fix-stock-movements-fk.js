module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove the old conflicting constraint (SET NULL but column is NOT NULL)
    // First, we need to find the name of the foreign key constraint.
    // In Sequelize, it's usually table_column_fkey, i.e., "stock_movements_product_id_fkey"
    try {
      await queryInterface.removeConstraint('stock_movements', 'stock_movements_product_id_fkey');
    } catch (e) {
      console.log("Constraint might have a different name, trying to find and drop manually or ignoring if already dropped.");
    }

    // 2. Add the correct constraint (CASCADE) so when a Product is deleted, its initial stock history vanishes cleanly.
    await queryInterface.addConstraint('stock_movements', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'stock_movements_product_id_fkey',
      references: {
        table: 'products',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('stock_movements', 'stock_movements_product_id_fkey');
    await queryInterface.addConstraint('stock_movements', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'stock_movements_product_id_fkey',
      references: {
        table: 'products',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};
