const AuditLog = require('../models/AuditLog');

module.exports = (req, res, next) => {
  // We only want to log mutations (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // We hook into the 'finish' event of the response to log after it completes
    res.on('finish', () => {
      // Don't log if it failed validation before doing anything, optional.
      // But logging attempts might be good. Let's log it anyway.
      
      const actionMap = {
        'POST': 'Criação',
        'PUT': 'Atualização',
        'PATCH': 'Atualização',
        'DELETE': 'Exclusão'
      };

      const action = actionMap[req.method] || req.method;
      const resource = req.originalUrl.split('?')[0]; // Clean query params

      // Mask sensitive fields like passwords
      let details = { ...req.body };
      if (details.password) details.password = '***';

      AuditLog.create({
        user_id: req.userId || null, // Can be null if it's a login attempt or public route
        action: action,
        resource: resource,
        details: details
      }).catch(err => {
        console.error('Failed to create audit log:', err);
      });
    });
  }

  next();
};
