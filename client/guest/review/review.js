const reviewsList = document.getElementById('reviews-list');
const submitBtn = document.getElementById('submit-review');
const reviewText = document.getElementById('review-text');
const stars = document.querySelectorAll('#star-rating i');
let selectedRating = 0;

// Fetch reviews
async function fetchReviews() {
  try {
    const response = await fetch('http://localhost:5000/api/reviews');
    const reviews = await response.json();

    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';

    reviews.forEach(review => {
      const reviewCard = document.createElement('div');
      reviewCard.classList.add('review-card');

      const stars = '⭐'.repeat(review.rating);

      reviewCard.innerHTML = `
        <h3>${review.first_name} ${review.last_name}</h3>
        <p>${review.comment}</p>
        <p>${stars}</p>
      `;

      reviewsContainer.appendChild(reviewCard);
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

// Handle star click
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = star.getAttribute('data-value');
    updateStars(selectedRating);
  });
});

function updateStars(rating) {
  stars.forEach(star => {
    if (star.getAttribute('data-value') <= rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

// Submit review
submitBtn.addEventListener('click', async () => {
  const text = reviewText.value.trim();
  if (!text || selectedRating === 0) {
    alert('Please enter review text and select a star rating.');
    return;
  }

  // Retrieve user_id from localStorage
  const userId = localStorage.getItem('user_id');
  console.log('Logged in user_id:', userId);
  if (!userId) {
    alert('User not logged in.');
    return;
  }

  console.log('Sending review data:', {
    user_id: userId,
    rating: selectedRating,
    comment: text
  });

  try {
    await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,  // Replace with the actual user ID
        rating: selectedRating,
        comment: text
      })
    });

    reviewText.value = '';
    selectedRating = 0;
    updateStars(0);
    fetchReviews(); // Refresh the list
  } catch (error) {
    console.error('Error submitting review:', error);
  }
});

// Initial load
fetchReviews();
