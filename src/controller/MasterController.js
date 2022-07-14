require('dotenv').config();

const express = require('express');

const jwt = require('jsonwebtoken');

const { User, Category } = require('../database/models');

const router = express.Router();

const secret = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: 'Token not found',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded) {
      return res.status(401).json({
        message: 'Expired or invalid token',
      });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Expired or invalid token' });
  }
};

const validateLogin = async (req, res, next) => {
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

  return next();
};

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, password } });

    const token = jwt.sign({ data: user }, secret);

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const validatePost = async (req, res, next) => {
  const regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

  const { displayName, email, password } = req.body;

  if (displayName.length < 8) {
    return res.status(400).json({
      message: '"displayName" length must be at least 8 characters long',
    });
  }

  if (!regex.test(email)) {
    return res.status(400).json({
      message: '"email" must be a valid email',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: '"password" length must be at least 6 characters long',
    });
  }

  return next();
};

router.post('/user', validatePost, async (req, res) => {
  try {
    const { displayName, email, password, image } = req.body;

    const exists = await User.findOne({ where: { email } });

    if (exists) {
      return res.status(409).json({
        message: 'User already registered',
      });
    }

    const user = await User.create({ displayName, email, password, image });

    const token = jwt.sign({ data: user }, secret);

    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/user', validateToken, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: 'password' } });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/user/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id },
      attributes: { exclude: 'password' },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User does not exist',
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/categories', validateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: '"name" is required',
      });
    }

    const category = await Category.create({ name });

    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
