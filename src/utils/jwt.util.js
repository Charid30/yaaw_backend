// src/utils/jwt.util.js
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (payload, expiresIn) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn || env.JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const decodeToken = (token) => jwt.decode(token);

module.exports = { generateToken, verifyToken, decodeToken };
