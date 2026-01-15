// Fetch all reviews and display them
fetch('http://localhost:5000/api/reviews')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('reviews-table-body');
        tableBody.innerHTML = '';

        data.forEach(review => {
            const row = `
                <tr>
                    <td>${review.review_id}</td>
                    <td>${review.first_name} ${review.last_name}</td>
                    <td>${review.rating}</td>
                    <td>${review.comment}</td>
                    <td> 
                        <button onclick="deleteReview(${review.review_id})">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error('Error fetching reviews:', error));

// Function to delete a review
function deleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
        fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('Review deleted!');
                window.location.reload();
            } else {
                alert('Failed to delete review.');
            }
        });
    }
}


  // Search bar
  setupTableSearch('search-review', 'reviews-table-body');

 function setupTableSearch(inputId, tableBodyId) {
    const searchInput = document.getElementById(inputId);
    const tableBody = document.getElementById(tableBodyId);

    if (!searchInput || !tableBody) return;

    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(filter) ? '' : 'none';
        });
    });
}
