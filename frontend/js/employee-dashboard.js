// Declare the required functions and variables before using them
function checkAuth(userType) {
  // Placeholder for authentication logic
  console.log(`Authenticating ${userType}`)
}

function getMenuDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDayNameFromDate(dateString) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const date = new Date(dateString)
  return days[date.getDay()]
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const mealTypes = ["Breakfast", "Lunch", "Snacks"]

function updateTime() {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  document.getElementById("currentTime").textContent = `Current Time: ${hour}:${minute}`
}

function getCanSelectMeals() {
  const now = new Date()
  return now.getHours() < 21
}

function loadMealSelection() {
  const menuDateString = getMenuDateString()
  const dayName = getDayNameFromDate(menuDateString)
  const canSelect = getCanSelectMeals()

  document.getElementById("menuDateDisplay").innerHTML = `
    <strong>Select Meals For:</strong> ${dayName} (${menuDateString})
  `

  const weeklyMenu = JSON.parse(localStorage.getItem("weeklyMenu")) || {}
  const dayMenu = weeklyMenu[dayName] || {}

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
          <input type="checkbox" value="${mealType}:${item}" ${canSelect ? "" : "disabled"}>
          <span class="meal-choice-name">${item}</span>
        </label>
      `,
              )
              .join("")
          : ""
      }
    </div>
  `,
    )
    .join("")

  const submitBtn = document.getElementById("submitBtn")
  const lockedMessage = document.getElementById("lockedMessage")
  const form = document.getElementById("mealSelectionForm")

  if (canSelect) {
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

  checkPreviousSubmission()
}

function checkPreviousSubmission() {
  const menuDateString = getMenuDateString()
  const submissions = JSON.parse(localStorage.getItem("mealSubmissions")) || {}

  if (submissions[menuDateString]) {
    document.getElementById("successMessage").classList.add("show")
    document.getElementById("submitBtn").disabled = true
    document.getElementById("submitBtn").textContent = "Already Submitted"
  }
}

document.getElementById("mealSelectionForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const menuDateString = getMenuDateString()
  const submissions = JSON.parse(localStorage.getItem("mealSubmissions")) || {}

  if (submissions[menuDateString]) {
    alert("You have already submitted your meal selection for this day!")
    return
  }

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

  submissions[menuDateString] = selectedItems
  localStorage.setItem("mealSubmissions", JSON.stringify(submissions))

  document.getElementById("successMessage").classList.add("show")
  document.getElementById("submitBtn").disabled = true
  document.getElementById("submitBtn").textContent = "Already Submitted"

  setTimeout(() => {
    document.getElementById("successMessage").classList.remove("show")
  }, 3000)
})

setInterval(updateTime, 1000)
updateTime()
loadMealSelection()
setInterval(loadMealSelection, 1000)
