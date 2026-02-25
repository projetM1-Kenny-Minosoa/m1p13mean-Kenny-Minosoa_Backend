const { body, validationResult } = require("express-validator");

exports.validateUser = [
  body("name").notEmpty().withMessage("Le nom est requis"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("email").isEmail().withMessage("Email invalide"),
];

exports.validateProduct = [
  body("name").notEmpty().withMessage("Le nom est requis"),
  body("price")
    .isNumeric()
    .withMessage("Le prix doit être un nombre")
    .custom((value) => value >= 0),
  body("shopId").notEmpty().withMessage("Id boutique invvalide"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

exports.validateOrder = [
  body("products.*.productId").notEmpty().withMessage("ID produit requis"),
  body("products.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantité invalide"),
  body("shopId").notEmpty().withMessage("ID boutique requis"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

exports.validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("La note doit être entre 1 et 5"),
  body("comment").optional().trim(),
  body("productId").notEmpty().withMessage("Produit requis"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

exports.validateShop = [
  body("name").notEmpty().withMessage("Le nom de la boutique est obligatoire"),
  body("address").notEmpty().withMessage("L'adresse est obligatoire"),
  body("vendorId").notEmpty().withMessage("Le vendeur doit exister"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];
