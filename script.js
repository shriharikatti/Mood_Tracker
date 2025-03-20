const moodButtons = document.querySelectorAll(".mood-btn");
const saveButton = document.getElementById("save-btn");
const moodList = document.getElementById("mood-list");
const showMonthly = document.getElementById("show-monthly");
const showWeekly = document.getElementById("show-weekly");
const showToday = document.getElementById("show-today");
const timelineTitle = document.getElementById("timeline-title");

let selectedMood = null;

// Helper function to safely get mood logs
function getMoodLogs() {
  try {
    return JSON.parse(localStorage.getItem("moodLogs")) || {};
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return {};
  }
}

// Handle mood selection
moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedMood = button.dataset.mood;
  });
});

// Save mood and update logs
saveButton.addEventListener("click", () => {
  if (!selectedMood) {
    alert("Please select a mood!");
    return;
  }

  const currentDate = new Date().toISOString().split("T")[0];
  let moodLogs = getMoodLogs();

  if (!moodLogs[currentDate]) {
    moodLogs[currentDate] = [];
  }
  moodLogs[currentDate].push(selectedMood);

  try {
    localStorage.setItem("moodLogs", JSON.stringify(moodLogs));
    console.log("Saved moods:", moodLogs);
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }

  selectedMood = null;
  moodButtons.forEach((btn) => btn.classList.remove("active"));

  timelineTitle.textContent = "Mood Logs"; // Reset to default after saving
  displayMoodLogs(moodLogs);
});

// Display mood logs in the timeline
function displayMoodLogs(moodLogs) {
  moodList.innerHTML = "";
  const sortedDates = Object.keys(moodLogs).sort((a, b) => new Date(b) - new Date(a));

  sortedDates.forEach((date) => {
    const li = document.createElement("li");
    const moodsWithEmojis = moodLogs[date].map(mood => `${getMoodEmoji(mood)} ${mood}`).join(", ");
    li.textContent = `${date}: ${moodsWithEmojis}`;
    moodList.appendChild(li);
  });
}

// Mood to emoji mapping
function getMoodEmoji(mood) {
  const moodMap = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    excited: "😃",
  };
  return moodMap[mood] || "";
}

// Filter moods based on range and update title
function filterMoods(range) {
  const moodLogs = getMoodLogs();
  let filteredLogs = {};

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (range === "today") {
    filteredLogs[todayStr] = moodLogs[todayStr] || [];
    timelineTitle.textContent = "Today's Log";
  } else if (range === "week") {
    let startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    const startDateStr = startDate.toISOString().split("T")[0];

    Object.keys(moodLogs).forEach((date) => {
      if (date >= startDateStr && date <= todayStr) {
        filteredLogs[date] = moodLogs[date];
      }
    });
    timelineTitle.textContent = "Weekly Logs";
  } else if (range === "month") {
    let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDateStr = startDate.toISOString().split("T")[0];

    Object.keys(moodLogs).forEach((date) => {
      if (date >= startDateStr && date <= todayStr) {
        filteredLogs[date] = moodLogs[date];
      }
    });
    timelineTitle.textContent = "Monthly Logs";
  }

  console.log(`Filtered logs for ${range}:`, filteredLogs);
  displayMoodLogs(filteredLogs);
}

// Filter button event listeners
showMonthly.addEventListener("click", () => filterMoods("month"));
showWeekly.addEventListener("click", () => filterMoods("week"));
showToday.addEventListener("click", () => filterMoods("today"));

// Load full logs on page load
document.addEventListener("DOMContentLoaded", () => {
  const moodLogs = getMoodLogs();
  timelineTitle.textContent = "Mood Logs"; // Default title on load
  displayMoodLogs(moodLogs);
});