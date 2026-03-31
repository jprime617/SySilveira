module.exports = async (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Only ADMIN can perform this action.' });
  }
  return next();
};
