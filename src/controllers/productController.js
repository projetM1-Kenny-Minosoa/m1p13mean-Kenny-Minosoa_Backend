const Product = require("../models/Product");
const Shop = require("../models/Shop");

// @desc    Create product
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;

    const shop = await Shop.findById(req.body.shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Boutique non trouvée",
      });
    }

    if (
      req.user.role !== "admin" &&
      shop.vendorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    if (shop.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Votre boutique doit être approuvée",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      shopId: shop._id,
      category,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const {
      shopId,
      category,
      minPrice,
      maxPrice,
      search,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    if (shopId) query.shopId = shopId;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate("shopId", "name status")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "shopId",
      "name status",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    const shop = await Shop.findById(product.shopId);
    if (
      req.user.role !== "admin" &&
      shop.vendorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    const { name, description, price, stock, category, images, isActive } =
      req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category) product.category = category;
    if (images) product.images = images;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    const shop = await Shop.findById(product.shopId);
    if (
      req.user.role !== "admin" &&
      shop.vendorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    await product.remove();

    res.json({
      success: true,
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get products by shop
// @route   GET /api/products/shop/:shopId
// @access  Public
exports.getProductsByShop = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find({
      shopId: req.params.shopId,
      isActive: true,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort("-createdAt");

    const total = await Product.countDocuments({
      shopId: req.params.shopId,
      isActive: true,
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
