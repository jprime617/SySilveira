'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Encontrar todos os clientes e agrupar por nome (case insensitive)
      // Usaremos CTEs para atualizar as referências nas tabelas relacionadas
      
      const updateSalesQuery = `
        WITH duplicated AS (
          SELECT LOWER(TRIM(name)) as lower_name
          FROM clients
          GROUP BY LOWER(TRIM(name))
          HAVING COUNT(*) > 1
        ),
        ranked_clients AS (
          SELECT id, LOWER(TRIM(name)) as lower_name,
                 ROW_NUMBER() OVER(PARTITION BY LOWER(TRIM(name)) ORDER BY id ASC) as rn
          FROM clients
          WHERE LOWER(TRIM(name)) IN (SELECT lower_name FROM duplicated)
        )
        UPDATE sales
        SET client_id = primary_client.id
        FROM ranked_clients as dup
        JOIN ranked_clients as primary_client 
          ON primary_client.lower_name = dup.lower_name AND primary_client.rn = 1
        WHERE sales.client_id = dup.id AND dup.rn > 1;
      `;
      await queryInterface.sequelize.query(updateSalesQuery, { transaction });

      const updatePricesQuery = `
        WITH duplicated AS (
          SELECT LOWER(TRIM(name)) as lower_name
          FROM clients
          GROUP BY LOWER(TRIM(name))
          HAVING COUNT(*) > 1
        ),
        ranked_clients AS (
          SELECT id, LOWER(TRIM(name)) as lower_name,
                 ROW_NUMBER() OVER(PARTITION BY LOWER(TRIM(name)) ORDER BY id ASC) as rn
          FROM clients
          WHERE LOWER(TRIM(name)) IN (SELECT lower_name FROM duplicated)
        )
        UPDATE client_prices
        SET client_id = primary_client.id
        FROM ranked_clients as dup
        JOIN ranked_clients as primary_client 
          ON primary_client.lower_name = dup.lower_name AND primary_client.rn = 1
        WHERE client_prices.client_id = dup.id AND dup.rn > 1;
      `;
      await queryInterface.sequelize.query(updatePricesQuery, { transaction });

      // There might be duplicate prices now if both clients had a price for the same product.
      // We should keep the primary one and delete the extra.
      const removeDuplicatePricesQuery = `
        WITH ranked_prices AS (
          SELECT id,
                 ROW_NUMBER() OVER(PARTITION BY client_id, product_id ORDER BY id ASC) as rn
          FROM client_prices
        )
        DELETE FROM client_prices WHERE id IN (SELECT id FROM ranked_prices WHERE rn > 1);
      `;
      await queryInterface.sequelize.query(removeDuplicatePricesQuery, { transaction });

      const deleteClientsQuery = `
        WITH duplicated AS (
          SELECT LOWER(TRIM(name)) as lower_name
          FROM clients
          GROUP BY LOWER(TRIM(name))
          HAVING COUNT(*) > 1
        ),
        ranked_clients AS (
          SELECT id, LOWER(TRIM(name)) as lower_name,
                 ROW_NUMBER() OVER(PARTITION BY LOWER(TRIM(name)) ORDER BY id ASC) as rn
          FROM clients
          WHERE LOWER(TRIM(name)) IN (SELECT lower_name FROM duplicated)
        )
        DELETE FROM clients
        WHERE id IN (SELECT id FROM ranked_clients WHERE rn > 1);
      `;
      await queryInterface.sequelize.query(deleteClientsQuery, { transaction });

      // Create unique index using raw SQL since it requires lower() and trim()
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_client_name_idx ON clients (LOWER(TRIM(name)));
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // There is no easy way to undo a merge of data, but we can drop the index.
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS unique_client_name_idx;
    `);
  }
};
