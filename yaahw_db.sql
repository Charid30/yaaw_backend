-- ============================================================
--  YAAHW — Script de création de la base de données
--  Version : 0.10.0
--  Encodage : UTF-8
--  Moteur : InnoDB | Charset : utf8mb4 | Collation : unicode_ci
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ── Base de données ──────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS `yaahw_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `yaahw_db`;


-- ============================================================
--  TABLE : users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`           CHAR(36)      NOT NULL COMMENT 'UUID v4',
  `nom`          VARCHAR(100)  NOT NULL,
  `prenom`       VARCHAR(100)  NOT NULL,
  `telephone`    VARCHAR(20)   NOT NULL UNIQUE COMMENT 'Numéro unique (ex: +22670000000)',
  `password`     VARCHAR(255)  NOT NULL COMMENT 'Hash bcrypt (cost 12)',
  `role`         ENUM(
                   'ADMIN',
                   'GERANT',
                   'CAISSIER'
                 )             NOT NULL DEFAULT 'GERANT',
  `is_active`    TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '1=actif, 0=désactivé',
  `last_login`   DATETIME               DEFAULT NULL,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_telephone` (`telephone`),
  KEY `idx_users_role`      (`role`),
  KEY `idx_users_is_active` (`is_active`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Utilisateurs de la plateforme Yaahw';


-- ============================================================
--  TABLE : revoked_tokens
--  (Blacklist JWT — invalidation à la déconnexion)
-- ============================================================
CREATE TABLE IF NOT EXISTS `revoked_tokens` (
  `id`         CHAR(36)    NOT NULL COMMENT 'UUID v4',
  `token`      TEXT        NOT NULL COMMENT 'Token JWT complet',
  `user_id`    CHAR(36)    NOT NULL,
  `expires_at` DATETIME    NOT NULL COMMENT 'Date d expiration du token',
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_rt_user_id`    (`user_id`),
  KEY `idx_rt_expires_at` (`expires_at`),

  CONSTRAINT `fk_revoked_tokens_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tokens JWT révoqués (déconnexion explicite)';


-- ============================================================
--  TABLE : shops
--  (Une boutique par gérant — configurée via le wizard)
-- ============================================================
CREATE TABLE IF NOT EXISTS `shops` (
  `id`            CHAR(36)      NOT NULL COMMENT 'UUID v4',
  `nom`           VARCHAR(100)  NOT NULL COMMENT 'Nom affiché de la boutique',
  `type_commerce` ENUM(
                    'boutique',
                    'restaurant',
                    'pharmacie',
                    'cave'
                  )             NOT NULL COMMENT 'Type de commerce',
  `devise`        VARCHAR(10)   NOT NULL DEFAULT 'FCFA' COMMENT 'Devise (ex: FCFA, EUR)',
  `tva_enabled`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1=TVA activée',
  `tva_rate`      DECIMAL(5,2) NOT NULL DEFAULT 18.00 COMMENT 'Taux de TVA en %',
  `modules`       JSON         NOT NULL COMMENT '{"stock":true,"commandes":false,"rapports":true}',
  `owner_id`      CHAR(36)     NOT NULL COMMENT 'FK → users.id (gérant propriétaire)',
  `is_configured` TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1=wizard terminé',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shops_owner` (`owner_id`) COMMENT 'Un gérant = une seule boutique',
  KEY `idx_shops_type`       (`type_commerce`),
  KEY `idx_shops_is_configured` (`is_configured`),

  CONSTRAINT `fk_shops_owner`
    FOREIGN KEY (`owner_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Boutiques configurées via le wizard d onboarding';


-- ============================================================
--  TABLE : categories
-- ============================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         CHAR(36)     NOT NULL COMMENT 'UUID v4',
  `nom`        VARCHAR(80)  NOT NULL,
  `couleur`    VARCHAR(7)   NOT NULL DEFAULT '#6366f1' COMMENT 'Couleur hex',
  `icone`      VARCHAR(30)  NOT NULL DEFAULT 'package'  COMMENT 'Nom icône Lucide (ex: package, shopping-bag)',
  `shop_id`    CHAR(36)     NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_cat_shop` (`shop_id`),
  KEY `idx_cat_nom`  (`nom`),

  CONSTRAINT `fk_categories_shop`
    FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catégories de produits par boutique';


-- ============================================================
--  TABLE : products
-- ============================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id`           CHAR(36)       NOT NULL COMMENT 'UUID v4',
  `nom`          VARCHAR(150)   NOT NULL,
  `description`  TEXT                    DEFAULT NULL,
  `prix`         DECIMAL(10,2)  NOT NULL COMMENT 'Prix de vente',
  `prix_achat`   DECIMAL(10,2)           DEFAULT NULL COMMENT 'Prix d achat',
  `categorie_id` CHAR(36)                DEFAULT NULL,
  `shop_id`      CHAR(36)       NOT NULL,
  `stock_qty`    INT            NOT NULL DEFAULT 0,
  `unite`        VARCHAR(20)    NOT NULL DEFAULT 'pièce',
  `code_barre`   VARCHAR(100)            DEFAULT NULL,
  `is_active`    TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_prod_shop`       (`shop_id`),
  KEY `idx_prod_categorie`  (`categorie_id`),
  KEY `idx_prod_is_active`  (`is_active`),
  KEY `idx_prod_code_barre` (`code_barre`),

  CONSTRAINT `fk_products_shop`
    FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_categorie`
    FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catalogue produits par boutique';


-- ============================================================
--  TABLE : sales
-- ============================================================
CREATE TABLE IF NOT EXISTS `sales` (
  `id`              CHAR(36)      NOT NULL,
  `shop_id`         CHAR(36)      NOT NULL,
  `caissier_id`     CHAR(36)      NOT NULL,
  `montant_total`   DECIMAL(10,2) NOT NULL,
  `montant_recu`    DECIMAL(10,2) NOT NULL,
  `monnaie_rendue`  DECIMAL(10,2) NOT NULL DEFAULT 0,
  `remise_montant`  DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Remise appliquée (valeur absolue)',
  `mode_paiement`   ENUM('especes','orange_money','moov_money') NOT NULL DEFAULT 'especes',
  `tva_montant`     DECIMAL(10,2) NOT NULL DEFAULT 0,
  `note`            TEXT          DEFAULT NULL,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_sales_shop`       (`shop_id`),
  KEY `idx_sales_caissier`   (`caissier_id`),
  KEY `idx_sales_created_at` (`created_at`),

  CONSTRAINT `fk_sales_shop`
    FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sales_caissier`
    FOREIGN KEY (`caissier_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Ventes enregistrées en caisse';


-- ============================================================
--  TABLE : sale_items
-- ============================================================
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id`            CHAR(36)      NOT NULL,
  `sale_id`       CHAR(36)      NOT NULL,
  `product_id`    CHAR(36)      DEFAULT NULL COMMENT 'Nullable si produit supprimé',
  `nom_produit`   VARCHAR(150)  NOT NULL     COMMENT 'Snapshot au moment de la vente',
  `prix_unitaire` DECIMAL(10,2) NOT NULL     COMMENT 'Snapshot prix',
  `quantite`      INT           NOT NULL,
  `montant`       DECIMAL(10,2) NOT NULL     COMMENT 'prix_unitaire × quantite',

  PRIMARY KEY (`id`),
  KEY `idx_si_sale`    (`sale_id`),
  KEY `idx_si_product` (`product_id`),

  CONSTRAINT `fk_si_sale`
    FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lignes de vente (panier)';


-- ============================================================
--  TABLE : stock_movements
--  (Traçabilité de tous les mouvements de stock)
-- ============================================================
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id`          CHAR(36)     NOT NULL COMMENT 'UUID v4',
  `shop_id`     CHAR(36)     NOT NULL,
  `product_id`  CHAR(36)     NOT NULL,
  `type`        ENUM(
                  'entree',
                  'sortie',
                  'ajustement',
                  'vente'
                )             NOT NULL COMMENT 'Type de mouvement',
  `quantite`    INT           NOT NULL COMMENT 'Quantité déplacée (toujours positive)',
  `stock_avant` INT           NOT NULL COMMENT 'Stock avant le mouvement',
  `stock_apres` INT           NOT NULL COMMENT 'Stock après le mouvement',
  `motif`       VARCHAR(255)  DEFAULT NULL COMMENT 'Raison du mouvement',
  `user_id`     CHAR(36)      DEFAULT NULL COMMENT 'Auteur (NULL = système)',
  `sale_id`     CHAR(36)      DEFAULT NULL COMMENT 'Vente associée si type=vente',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_sm_shop`       (`shop_id`),
  KEY `idx_sm_product`    (`product_id`),
  KEY `idx_sm_type`       (`type`),
  KEY `idx_sm_user`       (`user_id`),
  KEY `idx_sm_sale`       (`sale_id`),
  KEY `idx_sm_created_at` (`created_at`),

  CONSTRAINT `fk_sm_shop`
    FOREIGN KEY (`shop_id`)    REFERENCES `shops`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sm_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sm_user`
    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sm_sale`
    FOREIGN KEY (`sale_id`)    REFERENCES `sales`    (`id`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historique de tous les mouvements de stock';


-- ============================================================
--  SEED : Compte administrateur par défaut
--  Identifiants : +22600000000 / Admin@Yaahw2026!
--  ⚠  Changer le mot de passe dès la première connexion !
-- ============================================================
INSERT IGNORE INTO `users`
  (`id`, `nom`, `prenom`, `telephone`, `password`, `role`, `is_active`)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin',
  'Yaahw',
  '+22600000000',
  '$2b$12$sQQjuE/wgY9vx4z77rahGOhU8g34JXUlEaHTm8ojbN94gjyn7zvEq',
  'ADMIN',
  1
);


-- ============================================================
--  TABLE : customers
--  (Clients enregistrés par boutique)
-- ============================================================
CREATE TABLE IF NOT EXISTS `customers` (
  `id`         CHAR(36)     NOT NULL COMMENT 'UUID v4',
  `shop_id`    CHAR(36)     NOT NULL,
  `nom`        VARCHAR(150) NOT NULL,
  `telephone`  VARCHAR(30)  DEFAULT NULL,
  `email`      VARCHAR(150) DEFAULT NULL,
  `note`       TEXT         DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_customers_shop`      (`shop_id`),
  KEY `idx_customers_nom`       (`nom`),
  KEY `idx_customers_telephone` (`telephone`),

  CONSTRAINT `fk_customers_shop`
    FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Clients enregistrés par boutique';


-- ============================================================
--  TABLE : fournisseurs
-- ============================================================
CREATE TABLE IF NOT EXISTS `fournisseurs` (
  `id`         CHAR(36)     NOT NULL,
  `shop_id`    CHAR(36)     NOT NULL,
  `nom`        VARCHAR(150) NOT NULL,
  `telephone`  VARCHAR(30)  DEFAULT NULL,
  `email`      VARCHAR(150) DEFAULT NULL,
  `adresse`    TEXT         DEFAULT NULL,
  `note`       TEXT         DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_fournisseurs_shop`      (`shop_id`),
  KEY `idx_fournisseurs_nom`       (`nom`),

  CONSTRAINT `fk_fournisseurs_shop`
    FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Fournisseurs enregistrés par boutique';


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  FIN DU SCRIPT  v0.10.0
--  Tables : users, revoked_tokens, shops, categories,
--           products, sales, sale_items, stock_movements,
--           customers, fournisseurs
--  Compte admin créé :
--    Téléphone : +22600000000
--    Mot de passe : Admin@Yaahw2026!
--    (À modifier impérativement en production)
-- ============================================================
