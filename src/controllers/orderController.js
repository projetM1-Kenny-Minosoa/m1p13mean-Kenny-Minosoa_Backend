const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const History = require("../models/History");

// @desc    Create order
// @route   POST /api/orders
// @access  Private/Client
exports.createOrder = async (req, res) => {
  try {
    const { products, shopId, shippingAddress, paymentMethod } = req.body;

    let total = 0;
    const orderProducts = [];

    // Verify products and calculate total
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit ${item.productId} non trouvé`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Produit ${product.name} n'est pas disponible`,
        });
      }

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        name: product.name,
      });

      total += product.price * item.quantity;
    }

    const order = await Order.create({
      clientId: req.user._id,
      shopId,
      products: orderProducts,
      total,
      shippingAddress,
      paymentMethod,
      status: "pending",
    });

    // Create history entry
    await History.create({
      orderId: order._id,
      userId: req.user._id,
      type: "order_created",
      description: `Commande créée pour un total de ${total} Ar`,
      details: {
        status: "pending",
        total,
        products: orderProducts,
      },
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("clientId", "name email")
      .populate("shopId", "name")
      .populate("products.productId", "name price")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort("-createdAt");

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
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

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private/Client
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.user._id })
      .populate("shopId", "name")
      .populate("products.productId", "name images")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get shop orders
// @route   GET /api/orders/shop-orders
// @access  Private/Vendor
exports.getShopOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("shopId");

    if (!user.shopId) {
      return res.status(400).json({
        success: false,
        message: "Vous n'avez pas de boutique",
      });
    }

    const orders = await Order.find({ shopId: user.shopId._id })
      .populate("clientId", "name email")
      .populate("products.productId", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("clientId", "name email")
      .populate("shopId", "name")
      .populate("products.productId", "name price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
      });
    }

    // Check authorization
    if (
      req.user.role === "client" &&
      order.clientId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Vendor/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
      });
    }

    order.status = status;
    if (status === "delivered") {
      order.deliveryDate = new Date();
    }
    await order.save();

    // Create history entry
    await History.create({
      orderId: order._id,
      userId: req.user._id,
      type: "status_changed",
      description: `Statut de la commande changé à ${status}`,
      details: { status },
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
      });
    }

    // Check authorization
    if (
      req.user.role === "client" &&
      order.clientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Seules les commandes en attente peuvent être annulées",
      });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason;
    await order.save();

    // Create history entry
    await History.create({
      orderId: order._id,
      userId: req.user._id,
      type: "order_cancelled",
      description: "Commande annulée",
      details: { reason: req.body.reason },
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
