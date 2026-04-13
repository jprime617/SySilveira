const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const checkPassword = await bcrypt.compare(password, user.password_hash);
    if (!checkPassword) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, role } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        role,
      },
      token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      }),
    });
  }
};
