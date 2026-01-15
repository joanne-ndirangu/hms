const loading = document.getElementById('loading');
const error = document.getElementById('error');
const ctx = document.getElementById('dailyBookingsChart').getContext('2d');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const filterBtn = document.getElementById('filterBtn');
const activityTable = document.getElementById('activityTable');
const tableBody = activityTable.querySelector('tbody');

let chart;

async function fetchDailyActivity(startDate, endDate) {
  loading.style.display = 'block';
  error.textContent = '';
  activityTable.style.display = 'none';
  tableBody.innerHTML = '';

  try {
    // Build URL with query parameters if dates provided
    let url = 'http://localhost:5000/api/reports/daily-activity';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Prepare chart labels and data
    const labels = data.dailyActivity.map(item => {
      const d = new Date(item.booking_day);
      return d.toISOString().split('T')[0];
    });
    const counts = data.dailyActivity.map(item => item.total_bookings);

    // Destroy old chart if exists
    if (chart) {
      chart.destroy();
    }

    // Create chart
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Bookings',
          data: counts,
          backgroundColor: 'rgba(197, 157, 95, 0.6)',  
          borderColor: 'rgba(197, 157, 95, 1)', 
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1
          }
        }
      }
    });

    // Populate table
    data.dailyActivity.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(item.booking_day).toLocaleDateString()}</td>
        <td>${item.total_bookings}</td>
        <td>${parseFloat(item.total_revenue).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}</td>
      `;
      tableBody.appendChild(row);
    });

    // Show table
    activityTable.style.display = 'table';

  } catch (err) {
    error.textContent = `Error loading chart data: ${err.message}`;
  } finally {
    loading.style.display = 'none';
  }
}

// Fetch default data on page load (last 30 days)
fetchDailyActivity();

// Add event listener to filter button
filterBtn.addEventListener('click', () => {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    error.textContent = 'Please select both start and end dates.';
    return;
  }
  if (startDate > endDate) {
    error.textContent = 'Start date must be before end date.';
    return;
  }

  fetchDailyActivity(startDate, endDate);
});
