let timer;
let timeLeft = 0;
let isRunning = false;
let isBreak = false;

const workInput = document.getElementById("workDuration");
const breakInput = document.getElementById("breakDuration");
const timerDisplay = document.getElementById("timer");
const statsDisplay = document.getElementById("stats");
const alarmSound = document.getElementById("alarmSound");
const notification = document.getElementById("notification");
const timerIcon = document.getElementById("timerIcon");

function updateStats() {
  const today = new Date().toISOString().slice(0, 10);
  const stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  stats[today] = (stats[today] || 0) + 1;
  localStorage.setItem("pomodoroStats", JSON.stringify(stats));
  statsDisplay.innerText = `Pomodoros Today: ${stats[today]}`;
}

function loadStats() {
  const today = new Date().toISOString().slice(0, 10);
  const stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  statsDisplay.innerText = `Pomodoros Today: ${stats[today] || 0}`;
}

function showNotification(message) {
  notification.innerText = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

function startTimer() {
  if (isRunning) return;
  isBreak = false;
  isRunning = true;
  timeLeft = parseInt(workInput.value) * 60;
  timerIcon.src = "work-icon.svg"; // Change to work icon
  showNotification("Pomodoro Started!");
  countdown();
}

function startBreak() {
  isBreak = true;
  timeLeft = parseInt(breakInput.value) * 60;
  timerIcon.src = "break-icon.svg"; // Change to break icon
  showNotification("Break Started!");
  countdown();
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  showNotification("Pomodoro Paused!");
}

function resumeTimer() {
  if (!isRunning && timeLeft > 0) {
    isRunning = true;
    showNotification("Pomodoro Resumed!");
    countdown();
  }
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isBreak = false;
  timerDisplay.innerText = `${workInput.value.padStart(2, '0') || '40'}:00`;
  showNotification("Pomodoro Reset!");
}

function countdown() {
  updateDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      alarmSound.play();
      if (!isBreak) {
        updateStats();
        showNotification("Work Session Ended! Take a break.");
        startBreak();
      } else {
        showNotification("Break Over! Back to work.");
        resetTimer();
      }
    }
  }, 1000);
}

function updateDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (timeLeft <= 10 * 60) {  // When time is under 10 minutes
    timerDisplay.classList.add('warning');
    timerDisplay.classList.remove('normal');
  } else {
    timerDisplay.classList.add('normal');
    timerDisplay.classList.remove('warning');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.querySelector(".container").classList.toggle("dark-mode");
}

// Load stats when page is loaded
loadStats();
