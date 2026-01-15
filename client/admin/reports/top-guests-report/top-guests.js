const loadBtn = document.getElementById('loadBtn');
    const guestsTable = document.getElementById('guestsTable');
    const tbody = guestsTable.querySelector('tbody');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const limitInput = document.getElementById('limit');

    async function fetchTopGuests(limit) {
      loading.style.display = 'block';
      error.textContent = '';
      guestsTable.style.display = 'none';
      tbody.innerHTML = '';

      try {
        const response = await fetch(`http://localhost:5000/api/reports/top-guests?limit=${limit}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.topGuests.length === 0) {
          error.textContent = 'No guest data found.';
          return;
        }

        data.topGuests.forEach(guest => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${guest.guest_name}</td>
            <td>${guest.total_bookings}</td>
            <td>${Number(guest.total_spent).toFixed(2)}</td>
          `;
          tbody.appendChild(tr);
        });

        guestsTable.style.display = 'table';

      } catch (err) {
        error.textContent = `Error loading data: ${err.message}`;
      } finally {
        loading.style.display = 'none';
      }
    }

    loadBtn.addEventListener('click', () => {
      const limit = limitInput.value || 10;
      fetchTopGuests(limit);
    });

    // Load initial data
    fetchTopGuests(limitInput.value);