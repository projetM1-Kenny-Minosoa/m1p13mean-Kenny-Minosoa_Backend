const Shop = require("../models/Shop");
const User = require("../models/User");
const Product = require("../models/Product");

// @desc    Create shop
// @route   POST /api/shops
// @access  Private/Vendor
exports.createShop = async (req, res) => {
  try {
    const { name, description, category, address, contact } = req.body;

    if (req.user.role === "vendor") {
      const existingShop = await Shop.findOne({ vendorId: req.user._id });
      if (existingShop) {
        return res.status(400).json({
          success: false,
          message: "Vous possédez déjà une boutique"
        });
      }
    }

    const shop = await Shop.create({
      name,
      description,
      address,
      category,
      contact,
      vendorId: req.user._id
    });

    if (req.user.role === "vendor") {
      await User.findByIdAndUpdate(req.user._id, { shopId: shop._id });
    }

    res.status(201).json({
      success: true,
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
exports.getAllShops = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const shops = await Shop.find(query)
      .populate("vendorId", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort("-createdAt");

    const total = await Shop.countDocuments(query);

    res.json({
      success: true,
      data: shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate("vendorId", "name email")
      .populate({
        path: "products",
        options: { limit: 10 }
      });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Boutique introuvable"
      });
    }

    const productsCount = await Product.countDocuments({ shopId: shop._id, isActive: true });

    res.json({
      success: true,
      data: {
        ...shop.toObject(),
        productsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private/Vendor/Admin
exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Boutique introuvable"
      });
    }

    if (req.user.role !== "admin" && shop.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Autorisation insuffisante"
      });
    }

    const { name, description, category, address, contact, status } = req.body;

    if (status && req.user.role === "admin") {
      shop.status = status;
    }

    if (name) shop.name = name;
    if (description) shop.description = description;
    if (category) shop.category = category;
    if (address) shop.address = address;
    if (contact) shop.contact = contact;

    await shop.save();

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private/Admin
exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Boutique introuvable"
      });
    }

    await Product.deleteMany({ shopId: shop._id });

    await User.findByIdAndUpdate(shop.vendorId, { $unset: { shopId: 1 } });

    await shop.remove();

    res.json({
      success: true,
      message: "Suppression de la boutique et ses produits réussie"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
