-- ============================================================
--  YAAHW — Script de création de la base de données
--  Version : 0.2.0
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


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  FIN DU SCRIPT
--  Compte admin créé :
--    Téléphone : +22600000000
--    Mot de passe : Admin@Yaahw2026!
--    (À modifier impérativement en production)
-- ============================================================
