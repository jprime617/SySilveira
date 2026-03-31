const User = require('../models/User');

module.exports = {
  async store(req, res) {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password_hash: password, // will be hashed by the hook
      role,
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
};
