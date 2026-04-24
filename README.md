# Yaahw — Backend

API Node.js + Express + MySQL (Sequelize) pour **Yaahw**, application de point de vente (POS) configurable multi-contextes : boutique, restaurant, pharmacie, cave, etc.

## Stack

- **Node.js** + **Express 5**
- **MySQL** (via XAMPP en local) + **Sequelize** ORM
- **JWT** (cookie HttpOnly + Bearer fallback)
- **Joi** pour la validation
- Sécurité : Helmet, CORS restreint, rate limiting, mongo-sanitize, HPP
- Logs : Morgan
- Upload : Multer

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le .env.example et adapter
cp .env.example .env
# → Renseigner JWT_SECRET (obligatoire) et la DB

# 3. Créer la base de données (via phpMyAdmin ou ligne de commande)
#    CREATE DATABASE yaahw_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 4. Lancer en développement
npm run dev
```

Le serveur écoute sur `http://localhost:5000` par défaut.
Healthcheck : `GET /api/health`

## Arborescence

```
backend/
├── server.js                  # Point d'entrée (HTTP/HTTPS, IP réseau)
├── src/
│   ├── app.js                 # Configuration Express (CORS, sécurité, routes)
│   ├── config/
│   │   ├── env.js             # Chargement des variables d'environnement
│   │   └── database.js        # Instance Sequelize + test de connexion
│   ├── controllers/           # Contrôleurs (req/res, délèguent aux services)
│   ├── services/              # Logique métier
│   ├── models/                # Modèles Sequelize + index.js (associations)
│   ├── routes/                # Routes Express + index.js (montage /api)
│   ├── middlewares/           # auth, validate, error, ...
│   ├── validators/            # Schémas Joi
│   ├── utils/                 # JWT, réponses standardisées, ...
│   ├── jobs/                  # Tâches planifiées (cron)
│   └── scripts/               # Seeders, migrations ad-hoc
└── uploads/                   # Fichiers uploadés (exclu de git)
```

## Conventions

- **Fichiers** : `xxx.controller.js`, `xxx.service.js`, `xxx.routes.js`, `xxx.validator.js`
- **Modèles** : `PascalCase.js` (ex: `User.js`, `Product.js`)
- **Réponses API** : `{ success, message, data }` via `src/utils/response.util.js`
- **Auth** : le token est lu depuis le cookie HttpOnly `token` en priorité, sinon `Authorization: Bearer <token>`

## Sécurité

- `JWT_SECRET` obligatoire dans `.env` (le serveur refuse de démarrer sinon)
- Helmet (headers sécurité), CORS avec whitelist, rate limiting, sanitisation
- En production : HTTPS automatique si `SSL_KEY_PATH` + `SSL_CERT_PATH` fournis
