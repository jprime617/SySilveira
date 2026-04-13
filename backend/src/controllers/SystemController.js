const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const StockMovement = require('../models/StockMovement');
const { Op } = require('sequelize');

module.exports = {
  async cleanup(req, res) {
    try {
      // Data de corte: 12 meses atrás a partir de hoje
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 12);

      // Encontrar vendas mais antigas que a data de corte
      const oldSales = await Sale.findAll({
        where: {
          date: {
            [Op.lt]: cutoffDate
          }
        },
        attributes: ['id']
      });

      const oldSaleIds = oldSales.map(s => s.id);

      let deletedSales = 0;
      let deletedItems = 0;

      if (oldSaleIds.length > 0) {
        // Deletar os itens daquelas vendas primeiro para evitar erro de violação de Foreign Key
        deletedItems = await SaleItem.destroy({
          where: {
            sale_id: {
              [Op.in]: oldSaleIds
            }
          }
        });

        // E então deleta as vendas em si
        deletedSales = await Sale.destroy({
          where: {
            id: {
              [Op.in]: oldSaleIds
            }
          }
        });
      }

      // Limpar históricos de estoque antigos também (mais de 12 meses)
      const deletedStockMovements = await StockMovement.destroy({
        where: {
          created_at: {
            [Op.lt]: cutoffDate
          }
        }
      });

      return res.json({
        message: 'Limpeza concluída com sucesso.',
        details: {
          salesDeleted: deletedSales,
          itemsDeleted: deletedItems,
          stockMovementsDeleted: deletedStockMovements,
          cutoffDate: cutoffDate.toISOString()
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno ao realizar limpeza do sistema.' });
    }
  }
};
