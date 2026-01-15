document.addEventListener("DOMContentLoaded", () => {
  fetch('http://localhost:5000/api/reports/monthly-reviews')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      const reportBody = document.getElementById('report-body');
      reportBody.innerHTML = '';

      const labels = [];
      const ratings = [];

      data.forEach(row => {
        const averageRating = parseFloat(row.average_rating);
        const formattedAverageRating = isNaN(averageRating) ? '0.00' : averageRating.toFixed(2);

        // Populate table
        const reportRow = `
          <tr>
            <td>${row.year}</td>
            <td>${String(row.month).padStart(2, '0')}</td>
            <td>${formattedAverageRating}</td>
            <td>${row.total_reviews}</td>
          </tr>
        `;
        reportBody.innerHTML += reportRow;

        // Prepare data for chart
        labels.push(`${row.year}-${String(row.month).padStart(2, '0')}`);
        ratings.push(parseFloat(formattedAverageRating));
      });

      // Render Chart
      const ctx = document.getElementById('ratingChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Average Rating',
            data: ratings,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              title: {
                display: true,
                text: 'Rating'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching monthly report:', error));
});
