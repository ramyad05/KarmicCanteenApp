checkAuth("employee")

const mealTypes = ["Breakfast", "Lunch", "Snacks"]
let weeklyMenu = {}
let menuDateInfo = {}

function updateTime() {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  document.getElementById("currentTime").textContent = `Current Time: ${hour}:${minute}`
}

async function loadMealSelection() {
  try {
    // Get menu date info
    menuDateInfo = await utilityAPI.getMenuDate()
    
    document.getElementById("menuDateDisplay").innerHTML = `
      <strong>Select Meals For:</strong> ${menuDateInfo.day} (${menuDateInfo.date})
    `

    // Get weekly menu
    weeklyMenu = await menuAPI.getMenu()
    const dayMenu = weeklyMenu[menuDateInfo.day] || {}

    // Render meal choices
    const mealChoices = document.getElementById("mealChoices")
    mealChoices.innerHTML = mealTypes
      .map(
        (mealType) => `
      <div>
        <h3 style="font-weight: 600; margin-bottom: 0.75rem; color: var(--primary-color);">${mealType}</h3>
        ${
          dayMenu[mealType]
            ? dayMenu[mealType]
                .map(
                  (item) => `
          <label class="meal-choice">
            <input type="checkbox" value="${mealType}:${item}" ${menuDateInfo.can_select ? "" : "disabled"}>
            <span class="meal-choice-name">${item}</span>
          </label>
        `
                )
                .join("")
            : "<p>No items available</p>"
        }
      </div>
    `
      )
      .join("")

    // Update UI based on selection status
    const submitBtn = document.getElementById("submitBtn")
    const lockedMessage = document.getElementById("lockedMessage")
    const form = document.getElementById("mealSelectionForm")

    if (menuDateInfo.can_select) {
      submitBtn.disabled = false
      lockedMessage.style.display = "none"
      form.style.opacity = "1"
      form.style.pointerEvents = "auto"
    } else {
      submitBtn.disabled = true
      lockedMessage.style.display = "block"
      form.style.opacity = "0.6"
      form.style.pointerEvents = "none"
    }

    // Check if already submitted
    await checkPreviousSubmission()
  } catch (error) {
    console.error("Error loading meal selection:", error)
  }
}

async function checkPreviousSubmission() {
  try {
    const employee = JSON.parse(sessionStorage.getItem("employee"))
    const submissions = await submissionAPI.getEmployeeSubmissions(employee.email, menuDateInfo.date)

    if (submissions && submissions.length > 0) {
      document.getElementById("successMessage").classList.add("show")
      document.getElementById("submitBtn").disabled = true
      document.getElementById("submitBtn").textContent = "Already Submitted"
    }
  } catch (error) {
    // No submission found, which is fine
    console.log("No previous submission found")
  }
}

document.getElementById("mealSelectionForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const employee = JSON.parse(sessionStorage.getItem("employee"))
  
  // Collect selected meals
  const selectedItems = {}
  document.querySelectorAll(".meal-choice input:checked").forEach((checkbox) => {
    const [mealType, item] = checkbox.value.split(":")
    if (!selectedItems[mealType]) {
      selectedItems[mealType] = []
    }
    selectedItems[mealType].push(item)
  })

  if (Object.keys(selectedItems).length === 0) {
    alert("Please select at least one meal")
    return
  }

  try {
    await submissionAPI.submit({
      employee_email: employee.email,
      selected_meals: selectedItems
    })

    document.getElementById("successMessage").classList.add("show")
    document.getElementById("submitBtn").disabled = true
    document.getElementById("submitBtn").textContent = "Already Submitted"

    setTimeout(() => {
      document.getElementById("successMessage").classList.remove("show")
    }, 3000)
  } catch (error) {
    console.error("Error submitting meals:", error)
    alert(error.message || "Failed to submit meal selection")
  }
})

setInterval(updateTime, 1000)
updateTime()
loadMealSelection()
setInterval(loadMealSelection, 60000) // Refresh every minute instead of every second