checkAuth("admin")

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const mealTypes = ["Breakfast", "Lunch", "Snacks"]

let weeklyMenu = {}

async function loadMenu() {
  try {
    weeklyMenu = await menuAPI.getMenu()
    renderMenu()
  } catch (error) {
    console.error("Error loading menu:", error)
    alert("Failed to load menu")
  }
}

function renderMenu() {
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
            ${(weeklyMenu[day]?.[mealType] || [])
              .map(
                (item, idx) => `
              <div class="meal-item">
                <span class="meal-item-name">${item}</span>
                <div class="meal-item-actions">
                  <button type="button" class="btn-small btn-delete" onclick="deleteMeal('${day}', '${mealType}', ${idx})">Delete</button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("")
}

async function addMeal(day, mealType) {
  const input = document.querySelector(`input[data-day="${day}"][data-type="${mealType}"]`)
  const item = input.value.trim()

  if (item === "") {
    alert("Please enter a meal item")
    return
  }

  if (!weeklyMenu[day]) {
    weeklyMenu[day] = {}
  }
  if (!weeklyMenu[day][mealType]) {
    weeklyMenu[day][mealType] = []
  }

  weeklyMenu[day][mealType].push(item)

  try {
    await menuAPI.updateDayMenu(day, { meals: weeklyMenu[day] })
    input.value = ""
    renderMenu()
  } catch (error) {
    console.error("Error adding meal:", error)
    alert("Failed to add meal")
    // Revert the change
    weeklyMenu[day][mealType].pop()
  }
}

async function deleteMeal(day, mealType, index) {
  const deletedItem = weeklyMenu[day][mealType][index]
  weeklyMenu[day][mealType].splice(index, 1)

  try {
    await menuAPI.updateDayMenu(day, { meals: weeklyMenu[day] })
    renderMenu()
  } catch (error) {
    console.error("Error deleting meal:", error)
    alert("Failed to delete meal")
    // Revert the change
    weeklyMenu[day][mealType].splice(index, 0, deletedItem)
  }
}

loadMenu()