checkAuth("admin")

async function updateDashboard() {
  try {
    // Get menu date info
    const dateInfo = await utilityAPI.getMenuDate()
    const now = new Date()
    const hour = String(now.getHours()).padStart(2, "0")
    const minute = String(now.getMinutes()).padStart(2, "0")

    document.getElementById("menuDateDisplay").innerHTML = `
      <strong>Menu Being Prepared For:</strong> ${dateInfo.day} (${dateInfo.date})<br>
      <small>Current Time: ${hour}:${minute}</small>
    `

    // Get submission stats
    const stats = await submissionAPI.getStats()

    const statsContainer = document.getElementById("statsContainer")
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Meal Selections</div>
        <div class="stat-value">${stats.total}</div>
      </div>
      ${Object.entries(stats.meal_counts || {})
        .map(
          ([type, count]) => `
        <div class="stat-card">
          <div class="stat-label">${type} Count</div>
          <div class="stat-value">${count}</div>
        </div>
      `
        )
        .join("")}
    `
  } catch (error) {
    console.error("Error updating dashboard:", error)
  }
}

// Update dashboard every second
setInterval(updateDashboard, 1000)
updateDashboard()