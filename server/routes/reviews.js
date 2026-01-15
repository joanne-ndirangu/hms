// routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews');

// Get all reviews
router.get('/', reviewsController.getAllReviews);

// Create a review
router.post('/', reviewsController.createReview);

// Get all reviews for a specific user
router.get('/:userId', reviewsController.getReviewsByUser);

// Update a review
router.put('/:reviewId', reviewsController.updateReview);

// Delete a review
router.delete('/:reviewId', reviewsController.deleteReview);

module.exports = router;
