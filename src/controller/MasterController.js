require('dotenv').config();

const express = require('express');

const jwt = require('jsonwebtoken');

const { User } = require('../database/models');

const router = express.Router();

const secret = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Some required fields are missing',
      });
    }

    const user = await User.findOne({ where: { email, password } });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid fields',
      });
    }

    const token = jwt.sign({ data: user }, secret);

    return res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
