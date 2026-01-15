document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("report-body");
  const ctx = document.getElementById("stayDurationChart").getContext("2d");

  try {
    const response = await fetch("http://localhost:5000/api/reports/stay-duration");
    const result = await response.json();

    if (!result.stays || !Array.isArray(result.stays)) {
      throw new Error("Invalid data format: stays array missing");
    }

    // Aggregate stays by guest_name
    const guestMap = new Map();

    result.stays.forEach(({ guest_name, stay_duration_days }) => {
      if (!guestMap.has(guest_name)) {
        guestMap.set(guest_name, { total_stays: 0, total_days: 0 });
      }
      const guestData = guestMap.get(guest_name);
      guestData.total_stays++;
      guestData.total_days += stay_duration_days;
    });

    // Prepare arrays and table rows
    const guestNames = [];
    const averageStays = [];
    tableBody.innerHTML = "";

    guestMap.forEach((data, guest_name) => {
      const avgStay = data.total_days / data.total_stays;

      // Create table row
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = guest_name;
      const totalStaysCell = document.createElement("td");
      totalStaysCell.textContent = data.total_stays;
      const avgStayCell = document.createElement("td");
      avgStayCell.textContent = avgStay.toFixed(2);

      row.appendChild(nameCell);
      row.appendChild(totalStaysCell);
      row.appendChild(avgStayCell);
      tableBody.appendChild(row);

      guestNames.push(guest_name);
      averageStays.push(avgStay);
    });

    // Create Chart.js bar chart
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: guestNames,
        datasets: [{
          label: "Average Stay Duration (Days)",
          data: averageStays,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y.toFixed(2)} days`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Average Stay (Days)" }
          },
          x: {
            title: { display: true, text: "Guest" }
          }
        }
      }
    });

  } catch (error) {
    console.error("Error loading stay duration report:", error);
    tableBody.innerHTML = `<tr><td colspan="3">Error loading data</td></tr>`;
  }
});
