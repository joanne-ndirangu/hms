// controllers/reviews.js
const db = require('../db');

// Get all reviews
exports.getAllReviews = (req, res) => {
  const query = `
    SELECT 
      Reviews.review_id, 
      Reviews.user_id, 
      Reviews.rating, 
      Reviews.comment, 
      Users.first_name, 
      Users.last_name
    FROM Reviews
    JOIN Users ON Reviews.user_id = Users.user_id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).send('Error fetching reviews');
    res.status(200).json(result);
  });
};

// Create a review
exports.createReview = (req, res) => {
  const { user_id, rating, comment } = req.body;
  
  if (!user_id || !rating || !comment) {
    return res.status(400).send('Missing required fields');
  }

  const query = 'INSERT INTO Reviews (user_id, rating, comment) VALUES (?, ?, ?)';
  
  db.query(query, [user_id, rating, comment], (err, result) => {
    if (err) return res.status(500).send('Error creating review');
    res.status(201).send('Review created successfully');
  });
};

/// Get all reviews by a user
exports.getReviewsByUser = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      Reviews.review_id, 
      Reviews.user_id, 
      Reviews.rating, 
      Reviews.comment, 
      Users.first_name, 
      Users.last_name
    FROM Reviews
    JOIN Users ON Reviews.user_id = Users.user_id
    WHERE Reviews.user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).send('Error fetching reviews');
    if (result.length === 0) return res.status(404).send('No reviews found');
    res.status(200).json(result);
  });
};


// Update a review
exports.updateReview = (req, res) => {
  const reviewId = req.params.reviewId;
  const { rating, comment } = req.body;

  const query = 'UPDATE Reviews SET rating = ?, comment = ? WHERE review_id = ?';

  db.query(query, [rating, comment, reviewId], (err, result) => {
    if (err) return res.status(500).send('Error updating review');
    if (result.affectedRows === 0) return res.status(404).send('Review not found');
    res.status(200).send('Review updated successfully');
  });
};

// Delete a review
exports.deleteReview = (req, res) => {
  const reviewId = req.params.reviewId;

  const query = 'DELETE FROM Reviews WHERE review_id = ?';

  db.query(query, [reviewId], (err, result) => {
    if (err) return res.status(500).send('Error deleting review');
    if (result.affectedRows === 0) return res.status(404).send('Review not found');
    res.status(200).send('Review deleted successfully');
  });
};


