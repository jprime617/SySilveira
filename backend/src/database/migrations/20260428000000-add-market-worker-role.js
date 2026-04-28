'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona o valor 'MARKET_WORKER' ao enum existente
    // NOTA: Como o PostgreSQL não suporta ALTER TYPE ADD VALUE dentro de transações,
    // garantimos que essa query rode separadamente.
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'MARKET_WORKER';`
    );
  },

  down: async (queryInterface, Sequelize) => {
    // O PostgreSQL não possui uma forma fácil de remover valores de ENUM (DROP VALUE não existe).
    // Geralmente em rollbacks de enums, mantemos o valor órfão no banco e o removemos da aplicação,
    // ou precisamos criar um novo enum e migrar as colunas. 
    // Por simplicidade, este rollback será vazio.
    console.log("Atenção: Rollback de valores ENUM no PostgreSQL não é suportado nativamente. O valor 'MARKET_WORKER' permanecerá no banco.");
  }
};
