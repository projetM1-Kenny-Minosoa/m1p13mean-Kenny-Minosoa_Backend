const History = require("../models/History");

// @desc    Get user history
// @route   GET /api/history/user/:userId
// @access  Private
exports.getUserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Check authorization
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé"
      });
    }

    const history = await History.find({ userId: req.params.userId })
      .populate("orderId", "orderNumber total status")
      .populate("details.products.productId", "name")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort("-createdAt");

    const total = await History.countDocuments({ userId: req.params.userId });

    res.json({
      success: true,
      data: history,
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

// @desc    Get order history
// @route   GET /api/history/order/:orderId
// @access  Private
exports.getOrderHistory = async (req, res) => {
  try {
    const history = await History.find({ orderId: req.params.orderId })
      .populate("userId", "name email role")
      .sort("createdAt");

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all history
// @route   GET /api/history
// @access  Private/Admin
exports.getAllHistory = async (req, res) => {
  try {
    const { type, userId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;

    const history = await History.find(query)
      .populate("userId", "name email")
      .populate("orderId", "orderNumber")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort("-createdAt");

    const total = await History.countDocuments(query);

    res.json({
      success: true,
      data: history,
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