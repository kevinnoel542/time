let timer;
let timeLeft = 0;
let isRunning = false;
let isBreak = false;

const workInput = document.getElementById("workDuration");
const breakInput = document.getElementById("breakDuration");
const timerDisplay = document.getElementById("timer");
const statsDisplay = document.getElementById("stats");
const alarmSound = document.getElementById("alarmSound");

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

function startTimer() {
  if (isRunning) return;
  isBreak = false;
  isRunning = true;
  timeLeft = parseInt(workInput.value) * 60;
  countdown();
}

function startBreak() {
  isBreak = true;
  timeLeft = parseInt(breakInput.value) * 60;
  countdown();
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resumeTimer() {
  if (!isRunning && timeLeft > 0) {
    isRunning = true;
    countdown();
  }
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isBreak = false;
  timerDisplay.innerText = `${workInput.value.padStart?.(2, '0') || '40'}:00`;
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
        alert("Work session done! Time for a break.");
        startBreak();
      } else {
        alert("Break over! Back to work.");
        resetTimer();
      }
    }
  }, 1000);
}

function updateDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

loadStats();
