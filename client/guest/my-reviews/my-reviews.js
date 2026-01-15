const reviewsContainer = document.getElementById('reviews-container');
const submitBtn = document.getElementById('submit-review');
const reviewText = document.getElementById('review-text');
const stars = document.querySelectorAll('#star-rating i');
let selectedRating = 0;
let editingReviewId = null;
const userId = localStorage.getItem('user_id');  // Get the logged-in user ID

// Fetch only the logged-in user's reviews
async function fetchMyReviews() {
    const userId = localStorage.getItem('user_id'); // Make sure this is correctly set
    console.log('Logged-in userId:', userId); // Log the userId to verify
  
    if (!userId) {
      alert('Please log in to view your reviews.');
      return;
    }
  
    try {
      // Fetch reviews for the logged-in user
      const response = await fetch(`http://localhost:5000/api/reviews/${userId}`);
      const reviews = await response.json();
  
      console.log('Fetched reviews:', reviews); // Log the fetched reviews to check the response
  
      reviewsContainer.innerHTML = '';
  
      if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews found. Add a review!</p>';
      } else {
        reviews.forEach(review => {
          const reviewCard = document.createElement('div');
          reviewCard.classList.add('review-card');
  
          const starsDisplay = '⭐'.repeat(review.rating);
  
          reviewCard.innerHTML = `
            <h3>${review.first_name} ${review.last_name}</h3>
            <p>${review.comment}</p>
            <p>${starsDisplay}</p>
            <button class="edit-button" data-review-id="${review.review_id}">Edit</button>
            <button class="delete-button" data-review-id="${review.review_id}">Delete</button>
          `;
  
          reviewsContainer.appendChild(reviewCard);
        });
      }
  
      // Attach event listeners to Edit and Delete buttons
      document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', handleEdit);
      });
  
      document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDelete);
      });
  
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }
  
// Handle star rating selection
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = star.getAttribute('data-value');
    updateStars(selectedRating);
  });
});

// Update the star display
function updateStars(rating) {
  stars.forEach(star => {
    if (star.getAttribute('data-value') <= rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

// Submit or Update review
submitBtn.addEventListener('click', async () => {
  const text = reviewText.value.trim();
  if (!text || selectedRating === 0) {
    alert('Please enter review text and select a star rating.');
    return;
  }

  if (!userId) {
    alert('User not logged in.');
    return;
  }

  const url = editingReviewId
    ? `http://localhost:5000/api/reviews/${editingReviewId}`
    : 'http://localhost:5000/api/reviews';
  const method = editingReviewId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        rating: selectedRating,
        comment: text
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit/update review');
    }

    reviewText.value = '';
    selectedRating = 0;
    updateStars(0);
    editingReviewId = null;
    fetchMyReviews();  // Refresh the list
  } catch (error) {
    console.error('Error submitting/updating review:', error);
    alert('Error: ' + error.message);
  }
});

// Edit review
async function handleEdit(event) {
  const reviewId = event.target.getAttribute('data-review-id');

  const reviewCard = event.target.closest('.review-card');
  const comment = reviewCard.querySelector('p').textContent;

  reviewText.value = comment;
  selectedRating = 3;  // You can dynamically set this based on the review's rating

  editingReviewId = reviewId;
  submitBtn.textContent = 'Update Review';  // Change button text to "Update"
}

// Delete review
async function handleDelete(event) {
  const reviewId = event.target.getAttribute('data-review-id');
  const confirmation = confirm('Are you sure you want to delete this review?');

  if (!confirmation) return;

  try {
    const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete review');
    }

    alert('Review deleted successfully!');
    fetchMyReviews();  // Refresh the list
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Error: ' + error.message);
  }
}

// Initial load
fetchMyReviews();
