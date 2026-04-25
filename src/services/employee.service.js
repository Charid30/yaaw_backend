// src/services/employee.service.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');

// ── Helpers ────────────────────────────────────────────────────

const notFound = (msg = 'Employé introuvable.') => {
  const err = new Error(msg); err.status = 404; return err;
};

const sanitize = (u) => ({
  id:         u.id,
  nom:        u.nom,
  prenom:     u.prenom,
  telephone:  u.telephone,
  role:       u.role,
  is_active:  !!u.is_active,
  shop_id:    u.shop_id,
  last_login: u.last_login,
  created_at: u.created_at,
});

// ── Service ────────────────────────────────────────────────────

/** Lister les caissiers d'une boutique */
const getEmployees = async (shop_id) => {
  const rows = await User.findAll({
    where:  { shop_id, role: 'CAISSIER' },
    order:  [['nom', 'ASC'], ['prenom', 'ASC']],
  });
  return rows.map(sanitize);
};

/** Créer un caissier */
const createEmployee = async (shop_id, { nom, prenom, telephone, password }) => {
  if (!nom?.trim() || !prenom?.trim() || !telephone?.trim() || !password) {
    const err = new Error('Tous les champs sont requis.'); err.status = 400; throw err;
  }
  if (password.length < 6) {
    const err = new Error('Le mot de passe doit contenir au moins 6 caractères.'); err.status = 400; throw err;
  }

  const existing = await User.findOne({ where: { telephone: telephone.trim() } });
  if (existing) {
    const err = new Error('Ce numéro est déjà utilisé.'); err.status = 409; throw err;
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    id:        uuidv4(),
    nom:       nom.trim(),
    prenom:    prenom.trim(),
    telephone: telephone.trim(),
    password:  hash,
    role:      'CAISSIER',
    shop_id,
    is_active: 1,
  });
  return sanitize(user);
};

/** Modifier nom / prénom / téléphone */
const updateEmployee = async (id, shop_id, { nom, prenom, telephone }) => {
  const user = await User.findOne({ where: { id, shop_id, role: 'CAISSIER' } });
  if (!user) throw notFound();

  if (telephone && telephone !== user.telephone) {
    const existing = await User.findOne({ where: { telephone } });
    if (existing) {
      const err = new Error('Ce numéro est déjà utilisé.'); err.status = 409; throw err;
    }
  }

  await user.update({
    nom:       nom?.trim()       ?? user.nom,
    prenom:    prenom?.trim()    ?? user.prenom,
    telephone: telephone?.trim() ?? user.telephone,
  });
  return sanitize(user);
};

/** Activer / désactiver */
const toggleEmployee = async (id, shop_id) => {
  const user = await User.findOne({ where: { id, shop_id, role: 'CAISSIER' } });
  if (!user) throw notFound();
  await user.update({ is_active: user.is_active ? 0 : 1 });
  return sanitize(user);
};

/** Réinitialiser le mot de passe */
const resetPassword = async (id, shop_id, nouveau_mot_de_passe) => {
  if (!nouveau_mot_de_passe || nouveau_mot_de_passe.length < 6) {
    const err = new Error('Mot de passe trop court (6 caractères minimum).'); err.status = 400; throw err;
  }
  const user = await User.findOne({ where: { id, shop_id, role: 'CAISSIER' } });
  if (!user) throw notFound();
  const hash = await bcrypt.hash(nouveau_mot_de_passe, 12);
  await user.update({ password: hash });
};

/** Supprimer un caissier */
const deleteEmployee = async (id, shop_id) => {
  const user = await User.findOne({ where: { id, shop_id, role: 'CAISSIER' } });
  if (!user) throw notFound();
  await user.destroy();
};

module.exports = { getEmployees, createEmployee, updateEmployee, toggleEmployee, resetPassword, deleteEmployee };
