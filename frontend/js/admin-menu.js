// Function declaration for checkAuth
function checkAuth(role) {
  // Placeholder for authentication logic
  console.log(`Checking authentication for role: ${role}`)
}

checkAuth("admin")

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const mealTypes = ["Breakfast", "Lunch", "Snacks"]

function loadMenu() {
  const weeklyMenu = JSON.parse(localStorage.getItem("weeklyMenu"))
  const menuContainer = document.getElementById("menuContainer")

  menuContainer.innerHTML = days
    .map(
      (day) => `
    <div class="day-section">
      <h2 class="day-title">${day}</h2>
      ${mealTypes
        .map(
          (mealType) => `
        <div class="meal-section">
          <h3 class="meal-type">${mealType}</h3>
          <div class="add-meal-form">
            <input type="text" class="meal-input" placeholder="Add new item" data-day="${day}" data-type="${mealType}">
            <button type="button" class="btn-small btn-add" onclick="addMeal('${day}', '${mealType}')">Add</button>
          </div>
          <div class="meal-items">
            ${weeklyMenu[day][mealType]
              .map(
                (item, idx) => `
              <div class="meal-item">
                <span class="meal-item-name">${item}</span>
                <div class="meal-item-actions">
                  <button type="button" class="btn-small btn-delete" onclick="deleteMeal('${day}', '${mealType}', ${idx})">Delete</button>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `,
    )
    .join("")
}

function addMeal(day, mealType) {
  const input = document.querySelector(`input[data-day="${day}"][data-type="${mealType}"]`)
  const item = input.value.trim()

  if (item === "") {
    alert("Please enter a meal item")
    return
  }

  const weeklyMenu = JSON.parse(localStorage.getItem("weeklyMenu"))
  weeklyMenu[day][mealType].push(item)
  localStorage.setItem("weeklyMenu", JSON.stringify(weeklyMenu))

  input.value = ""
  loadMenu()
}

function deleteMeal(day, mealType, index) {
  const weeklyMenu = JSON.parse(localStorage.getItem("weeklyMenu"))
  weeklyMenu[day][mealType].splice(index, 1)
  localStorage.setItem("weeklyMenu", JSON.stringify(weeklyMenu))
  loadMenu()
}

loadMenu()
