document.addEventListener('DOMContentLoaded', async () => {
  // Fetch report data if the table exists
  const tableBody = document.getElementById('report-table-body');
  if (tableBody) {
    try {
      const response = await fetch('http://localhost:5000/api/reports');
      const data = await response.json();

      tableBody.innerHTML = ''; // Clear existing content

      if (data.admin) {
        const adminRow = document.createElement('tr');
        adminRow.innerHTML = `
          <td>0</td>
          <td>Admin</td>
          <td>Admin</td>
          <td>—</td>
          <td>Total Guests: ${data.admin.total_guests}, <br><br> Total Bookings: ${data.admin.total_bookings}</td>
        `;
        tableBody.appendChild(adminRow);
      }

      if (data.guests && data.guests.length > 0) {
        data.guests.forEach((guest, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${guest.first_name} ${guest.last_name}</td>
            <td>Guest</td>
            <td>${new Date(guest.created_at).toLocaleDateString()}</td>
            <td>${guest.email}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6">No guest data available</td>`;
        tableBody.appendChild(row);
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
    }
  }
});
