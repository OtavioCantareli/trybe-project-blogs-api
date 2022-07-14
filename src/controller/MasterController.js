require('dotenv').config();

const express = require('express');

const jwt = require('jsonwebtoken');

const {
  User,
  Category,
  BlogPost,
  PostCategory,
} = require('../database/models');
// const PostCategory = require('../database/models/postCategory');

const router = express.Router();

const secret = process.env.JWT_SECRET;

const validateToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: 'Token not found',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    const user = await User.findOne({
      where: { displayName: decoded.data.displayName },
    });

    req.user = user;

    return next();
  } catch (err) {
    console.log(err);
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

const validateUserCreation = async (req, res, next) => {
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

router.post('/user', validateUserCreation, async (req, res) => {
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

router.get('/categories', validateToken, async (req, res) => {
  try {
    const categories = await Category.findAll();

    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const validatePost = async (req, res, next) => {
  const { title, content, categoryIds } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      message: 'Some required fields are missing',
    });
  }
  const categories = await Category.findAll({
    where: { id: categoryIds },
  });

  if (categories.length < 1) {
    return res.status(400).json({
      message: '"categoryIds" not found',
    });
  }

  return next();
};

const insertIds = async ({ categoryIds, post }) => {
  categoryIds.forEach((id) => {
    PostCategory.create({
      postId: post.dataValues.id,
      categoryId: id,
    });
  });
};

router.post('/post', validateToken, validatePost, async (req, res) => {
  try {
    const { title, content, categoryIds } = req.body;

    const post = await BlogPost.create({
      title,
      content,
      categoryIds,
      userId: req.user.dataValues.id,
      updated: Date.now(),
      published: Date.now(),
    });

    insertIds({ categoryIds, post });

    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
