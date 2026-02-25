const Review = require("../models/Review");
const Order = require("../models/Order");

// @desc    Create review
// @route   POST /api/reviews
// @access  Private/Client
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      clientId: req.user._id,
      productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà évalué ce produit",
      });
    }

    // Check if user purchased the product (if orderId provided)
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        clientId: req.user._id,
        "products.productId": productId,
        status: "delivered",
      });
      isVerifiedPurchase = !!order;
    }

    const review = await Review.create({
      clientId: req.user._id,
      productId,
      rating,
      comment,
      orderId,
      isVerifiedPurchase,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    })
      .populate("clientId", "name")
      .sort("-createdAt");

    // Calculate average rating
    const avgRating =
      reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length || 0;

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          total: reviews.length,
          averageRating: avgRating.toFixed(1),
          distribution: {
            1: reviews.filter((r) => r.rating === 1).length,
            2: reviews.filter((r) => r.rating === 2).length,
            3: reviews.filter((r) => r.rating === 3).length,
            4: reviews.filter((r) => r.rating === 4).length,
            5: reviews.filter((r) => r.rating === 5).length,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user reviews
// @route   GET /api/reviews/user/me
// @access  Private/Client
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ clientId: req.user._id })
      .populate("productId", "name images")
      .sort("-createdAt");

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/Client
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    if (review.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Client/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    if (
      req.user.role !== "admin" &&
      review.clientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: "Avis supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
