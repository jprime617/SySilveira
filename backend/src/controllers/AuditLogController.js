const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

module.exports = {
  async index(req, res) {
    try {
      const logs = await AuditLog.findAll({
        order: [['created_at', 'DESC']],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        limit: 1000 // Limit to avoid massive payloads
      });
      return res.json(logs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
};
