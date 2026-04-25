// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// =====================================================
// RATE LIMITING
// =====================================================
const AUTH_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

// Limite générale : 300 requêtes / 15 min / IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    AUTH_ROUTES.some((r) => req.path === r || req.originalUrl.startsWith(r)),
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.',
  },
});

// Limite stricte pour l'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 500 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives, veuillez réessayer dans 15 minutes.',
  },
});

// =====================================================
// CORS
// =====================================================
const allowedOrigins = [
  'http://localhost:4200', // Angular dev
  env.FRONTEND_URL,
].filter(Boolean);

// Réseau local en développement (192.168.x.x, 172.x.x.x, 10.x.x.x)
const localNetworkRegex =
  /^http:\/\/(192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman, apps natives
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (env.NODE_ENV === 'development' && localNetworkRegex.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origine non autorisée par CORS : ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
};

// =====================================================
// MIDDLEWARES GLOBAUX
// =====================================================

// Headers de sécurité (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS restreint
app.use(cors(corsOptions));

// Taille max du body — 10mb (fichiers passent par multer, cette limite couvre les JSON)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitisation des inputs (Express 5 : req.query est read-only → body et params uniquement)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

// Protection HTTP Parameter Pollution
app.use(hpp());

// Logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiters
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `Bienvenue sur l'API ${env.APP_NAME}`,
    version: '0.1.0',
    environment: env.NODE_ENV,
  });
});

// Routes API
app.use('/api', require('./routes'));

// 404 + gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

module.exports = app;
