let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let schedule = JSON.parse(localStorage.getItem("schedule")) || [];
let stats = JSON.parse(localStorage.getItem("stats")) || {
  completedTasks: 0,
  totalTasks: 0,
  pomodoroCount: 0,
  studyTime: 0,
  productivity: 0,
  streak: 0,
};

let timerInterval;
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerRunning = false;
let timerMode = "work";
let totalSeconds = 25 * 60;
let currentSessionGoal = "";
let isDarkMode = localStorage.getItem("darkMode") === "true";
let currentAmbientSound = null;
let isBreathing = false;
let breathingInterval;

const ambientSounds = {
  rain: "https://www.soundjay.com/misc/sounds/rain-01.wav",
  forest: "https://www.soundjay.com/nature/sounds/forest-01.wav",
  ocean: "https://www.soundjay.com/nature/sounds/ocean-01.wav",
  cafe: "https://www.soundjay.com/misc/sounds/cafe-01.wav",
};

const focusQuotes = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Focus on being productive instead of busy. - Tim Ferriss",
  "Concentrate all your thoughts upon the work at hand. - Alexander Graham Bell",
  "The successful warrior is the average man with laser-like focus. - Bruce Lee",
  "Wherever you are, be there totally. - Eckhart Tolle",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The art of being wise is knowing what to overlook. - William James",
  "You can't depend on your eyes when your imagination is out of focus. - Mark Twain",
];

document.addEventListener("DOMContentLoaded", function () {
  renderTasks();
  renderAssignments();
  renderSchedule();
  updateStats();
  displayRandomQuote();
  switchTab("tasks");
  loadSavedTheme();
});

function switchTab(tabName) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((content) => content.classList.remove("active"));

  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");

  if (tabName === "stats") {
    updateStats();
  }
}

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const category = document.getElementById("taskCategory").value;

  if (text) {
    const task = {
      id: Date.now(),
      text: text,
      priority: priority,
      category: category,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    stats.totalTasks++;
    saveData();
    renderTasks();
    document.getElementById("taskInput").value = "";
    showNotification("Task added successfully! 📝");
  }
}

function renderTasks() {
  const container = document.getElementById("taskList");
  container.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = `task-item priority-${task.priority} ${task.completed ? "completed" : ""}`;
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})" style="margin-right: 10px;">
        <span class="task-text">${task.text}</span>
        <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 2px 8px; border-radius: 12px; font-weight: 500; margin-left: 10px;">
          ${task.priority.toUpperCase()}
        </span>
      </div>
      <button class="btn btn-danger" onclick="deleteTask(${task.id})" style="padding: 8px 12px; margin: 0;">
        <i class="fas fa-trash"></i>
      </button>
    `;
    container.appendChild(taskElement);
  });
}

function getPriorityColor(priority) {
  if (priority === "high") return "#ff6b6b";
  if (priority === "medium") return "#ffa726";
  return "#66bb6a";
}

function getFilteredTasks() {
  const filter = document.getElementById("taskFilter").value;
  
  if (filter === "all") return tasks;
  if (filter === "pending") return tasks.filter(task => !task.completed);
  if (filter === "completed") return tasks.filter(task => task.completed);
  if (filter === "high" || filter === "medium" || filter === "low") {
    return tasks.filter(task => task.priority === filter);
  }
  
  return tasks;
}

function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) {
      stats.completedTasks++;
      showNotification("Great job! Task completed! 🎉");
    } else {
      stats.completedTasks--;
    }
    saveData();
    renderTasks();
    updateStats();
  }
}

function deleteTask(id) {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex > -1) {
    if (tasks[taskIndex].completed) {
      stats.completedTasks--;
    }
    stats.totalTasks--;
    tasks.splice(taskIndex, 1);
    saveData();
    renderTasks();
    updateStats();
    showNotification("Task deleted! 🗑️");
  }
}

function sortTasks(sortBy) {
  if (sortBy === "priority") {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }
  renderTasks();
}

function clearCompletedTasks() {
  const completedCount = tasks.filter(task => task.completed).length;
  tasks = tasks.filter(task => !task.completed);
  stats.totalTasks -= completedCount;
  stats.completedTasks -= completedCount;
  saveData();
  renderTasks();
  updateStats();
  showNotification(`${completedCount} completed tasks cleared! 🧹`);
}

function filterTasks() {
  renderTasks();
}

function addAssignment() {
  const name = document.getElementById("assignmentName").value.trim();
  const subject = document.getElementById("assignmentSubject").value.trim();
  const dueDate = document.getElementById("assignmentDue").value;
  const notes = document.getElementById("assignmentNotes").value.trim();

  if (name && subject && dueDate) {
    const assignment = {
      id: Date.now(),
      name: name,
      subject: subject,
      dueDate: dueDate,
      notes: notes,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    assignments.push(assignment);
    saveData();
    renderAssignments();
    
    document.getElementById("assignmentName").value = "";
    document.getElementById("assignmentSubject").value = "";
    document.getElementById("assignmentDue").value = "";
    document.getElementById("assignmentNotes").value = "";
    
    showNotification("Assignment added successfully! 📚");
  }
}

function renderAssignments() {
  const container = document.getElementById("assignmentList");
  container.innerHTML = "";

  const sortedAssignments = assignments.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  sortedAssignments.forEach((assignment) => {
    const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

    const assignmentElement = document.createElement("div");
    assignmentElement.className = `assignment-item ${assignment.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""} ${isDueSoon ? "due-soon" : ""}`;

    assignmentElement.innerHTML = `
      <div class="assignment-content">
        <input type="checkbox" ${assignment.completed ? "checked" : ""} onchange="toggleAssignment(${assignment.id})" style="margin-right: 10px;">
        <div>
          <div style="font-weight: bold;">${assignment.name}</div>
          <div style="color: #666; font-size: 0.9em;">${assignment.subject}</div>
          <div style="font-size: 0.9em; color: ${isOverdue ? "#dc3545" : isDueSoon ? "#ffc107" : "#666"};">
            Due: ${assignment.dueDate} 
            ${isOverdue ? `(${Math.abs(daysUntilDue)} days overdue)` : daysUntilDue === 0 ? "(Due today!)" : daysUntilDue === 1 ? "(Due tomorrow)" : `(${daysUntilDue} days left)`}
          </div>
          ${assignment.notes ? `<div style="font-size: 0.8em; color: #888; margin-top: 5px;">${assignment.notes}</div>` : ""}
        </div>
      </div>
      <button class="btn btn-danger" onclick="deleteAssignment(${assignment.id})" style="padding: 8px 12px; margin: 0;">
        <i class="fas fa-trash"></i>
      </button>
    `;
    container.appendChild(assignmentElement);
  });
}

function toggleAssignment(id) {
  const assignment = assignments.find((a) => a.id === id);
  if (assignment) {
    assignment.completed = !assignment.completed;
    saveData();
    renderAssignments();
    showNotification(assignment.completed ? "Assignment completed! Excellent work! 🎓" : "Assignment marked as pending! ⏳");
  }
}

function deleteAssignment(id) {
  const index = assignments.findIndex((a) => a.id === id);
  if (index > -1) {
    assignments.splice(index, 1);
    saveData();
    renderAssignments();
    showNotification("Assignment deleted! 🗑️");
  }
}

function addScheduleItem() {
  const time = document.getElementById("scheduleTime").value;
  const event = document.getElementById("scheduleEvent").value.trim();

  if (time && event) {
    const scheduleItem = {
      id: Date.now(),
      time: time,
      event: event,
      completed: false,
    };

    schedule.push(scheduleItem);
    saveData();
    renderSchedule();
    
    document.getElementById("scheduleTime").value = "";
    document.getElementById("scheduleEvent").value = "";
    
    showNotification("Schedule item added! 📅");
  }
}

function renderSchedule() {
  const container = document.getElementById("scheduleList");
  container.innerHTML = "";

  const sortedSchedule = schedule.sort((a, b) => a.time.localeCompare(b.time));

  sortedSchedule.forEach((item) => {
    const scheduleElement = document.createElement("div");
    scheduleElement.className = `schedule-item ${item.completed ? "completed" : ""}`;
    
    scheduleElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <input type="checkbox" ${item.completed ? "checked" : ""} onchange="toggleScheduleItem(${item.id})" style="margin-right: 10px;">
          <div>
            <div class="schedule-time">${item.time}</div>
            <div>${item.event}</div>
          </div>
        </div>
        <button class="btn btn-danger" onclick="deleteScheduleItem(${item.id})" style="padding: 8px 12px; margin: 0;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(scheduleElement);
  });
}

function toggleScheduleItem(id) {
  const item = schedule.find((item) => item.id === id);
  if (item) {
    item.completed = !item.completed;
    saveData();
    renderSchedule();
    showNotification(item.completed ? "Schedule item completed! ✅" : "Schedule item marked as pending! ⏳");
  }
}

function deleteScheduleItem(id) {
  const index = schedule.findIndex((item) => item.id === id);
  if (index > -1) {
    schedule.splice(index, 1);
    saveData();
    renderSchedule();
    showNotification("Schedule item deleted! 🗑️");
  }
}

function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    document.getElementById("timerDisplay").style.color = "#28a745";
    
    timerInterval = setInterval(() => {
      totalSeconds--;
      updateTimerDisplay();

      if (totalSeconds <= 0) {
        stopTimer();
        if (timerMode === "work") {
          stats.pomodoroCount++;
          stats.studyTime += 25;
          showNotification("Work session completed! Time for a break! 🎉");
          setTimerMode("break");
        } else {
          showNotification("Break time over! Ready for another session? 💪");
          setTimerMode("work");
        }
        saveData();
        updateStats();
      }
    }, 1000);
  }
}

function pauseTimer() {
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById("timerDisplay").style.color = "#ffc107";
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  totalSeconds = timerMode === "work" ? 25 * 60 : 5 * 60;
  updateTimerDisplay();
  document.getElementById("timerDisplay").style.color = "#667eea";
}

function stopTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  document.getElementById("timerDisplay").style.color = "#667eea";
}

function setTimerMode(mode) {
  timerMode = mode;
  totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  updateTimerDisplay();
  stopTimer();
  showNotification(`Timer set to ${mode} mode (${mode === "work" ? "25" : "5"} minutes)! 🔄`);
}

function updateTimerDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  
  document.getElementById("timerDisplay").textContent = timeString;
  
  const progress = document.getElementById("timerProgress");
  if (progress) {
    const totalTime = timerMode === "work" ? 25 * 60 : 5 * 60;
    const progressPercent = ((totalTime - totalSeconds) / totalTime) * 100;
    progress.style.width = progressPercent + "%";
  }
}

function setSessionGoal() {
  const goal = document.getElementById("sessionGoal").value.trim();
  if (goal) {
    currentSessionGoal = goal;
    document.getElementById("currentGoal").textContent = `Current Goal: ${goal}`;
    document.getElementById("sessionGoal").value = "";
    showNotification("Session goal set! 🎯");
  }
}

function updateStats() {
  document.getElementById("completedTasks").textContent = stats.completedTasks;
  document.getElementById("totalTasks").textContent = stats.totalTasks;
  document.getElementById("pomodoroCount").textContent = stats.pomodoroCount;
  document.getElementById("studyTime").textContent = stats.studyTime + "m";
  
  const productivity = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  document.getElementById("productivity").textContent = productivity + "%";
  
  document.getElementById("streak").textContent = stats.streak;
}

function resetStats() {
  if (confirm("Are you sure you want to reset all statistics? This action cannot be undone.")) {
    stats = {
      completedTasks: 0,
      totalTasks: 0,
      pomodoroCount: 0,
      studyTime: 0,
      productivity: 0,
      streak: 0,
    };
    saveData();
    updateStats();
    showNotification("Statistics reset! 🗑️");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const icon = document.getElementById("themeIcon");
  
  if (document.body.classList.contains("dark-mode")) {
    icon.className = "fas fa-sun";
    localStorage.setItem("darkMode", "true");
  } else {
    icon.className = "fas fa-moon";
    localStorage.setItem("darkMode", "false");
  }
}

function loadSavedTheme() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeIcon").className = "fas fa-sun";
  }
}

function toggleQuickAdd() {
  const modal = document.getElementById("quickAddModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

function quickAdd(type) {
  const input = document.getElementById("quickInput");
  const text = input.value.trim();
  
  if (text) {
    if (type === "task") {
      const task = {
        id: Date.now(),
        text: text,
        priority: "medium",
        category: "general",
        completed: false,
        createdAt: new Date().toISOString(),
      };
      tasks.push(task);
      stats.totalTasks++;
      renderTasks();
    } else if (type === "assignment") {
      const assignment = {
        id: Date.now(),
        name: text,
        subject: "General",
        dueDate: new Date().toISOString().split("T")[0],
        notes: "",
        completed: false,
        createdAt: new Date().toISOString(),
      };
      assignments.push(assignment);
      renderAssignments();
    } else if (type === "schedule") {
      const scheduleItem = {
        id: Date.now(),
        time: new Date().toTimeString().slice(0, 5),
        event: text,
        completed: false,
      };
      schedule.push(scheduleItem);
      renderSchedule();
    }
    
    input.value = "";
    toggleQuickAdd();
    saveData();
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added quickly! ⚡`);
  }
}

function toggleAmbientSound(soundType) {
  if (currentAmbientSound && currentAmbientSound.soundType === soundType) {
    currentAmbientSound.audio.pause();
    currentAmbientSound = null;
    updateSoundButtons();
    showNotification("Ambient sound stopped 🔇");
  } else {
    if (currentAmbientSound) {
      currentAmbientSound.audio.pause();
    }
    
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    
    currentAmbientSound = {
      audio: audio,
      soundType: soundType
    };
    
    updateSoundButtons();
    showNotification(`${soundType.charAt(0).toUpperCase() + soundType.slice(1)} sounds playing 🔊`);
  }
}

function updateSoundButtons() {
  const buttons = ["rainBtn", "forestBtn", "oceanBtn", "cafeBtn"];
  buttons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.style.background = currentAmbientSound && currentAmbientSound.soundType === btnId.replace("Btn", "") 
        ? "linear-gradient(135deg, #28a745, #20c997)" 
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  });
}

function adjustVolume(value) {
  document.getElementById("volumeLabel").textContent = value + "%";
  if (currentAmbientSound) {
    currentAmbientSound.audio.volume = value / 100;
  }
}

function startBreathingExercise() {
  if (!isBreathing) {
    isBreathing = true;
    document.getElementById("breathingBtn").innerHTML = '<i class="fas fa-stop"></i> Stop Breathing';
    
    let phase = 0;
    const phases = ["Breathe in...", "Hold...", "Breathe out...", "Hold..."];
    const durations = [4000, 1000, 4000, 1000];
    
    function nextPhase() {
      if (!isBreathing) return;
      
      document.getElementById("breathingInstruction").textContent = phases[phase];
      const circle = document.getElementById("breathingCircle");
      
      if (phase === 0) {
        circle.style.transform = "scale(1.3)";
      } else if (phase === 2) {
        circle.style.transform = "scale(1)";
      }
      
      setTimeout(() => {
        phase = (phase + 1) % 4;
        nextPhase();
      }, durations[phase]);
    }
    
    nextPhase();
  } else {
    isBreathing = false;
    document.getElementById("breathingBtn").innerHTML = '<i class="fas fa-play"></i> Start Breathing';
    document.getElementById("breathingInstruction").textContent = "";
    document.getElementById("breathingCircle").style.transform = "scale(1)";
  }
}

function displayRandomQuote() {
  const randomQuote = focusQuotes[Math.floor(Math.random() * focusQuotes.length)];
  document.getElementById("focusQuote").textContent = randomQuote;
}

function getNewQuote() {
  displayRandomQuote();
  showNotification("New motivational quote loaded! 💭");
}

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("assignments", JSON.stringify(assignments));
  localStorage.setItem("schedule", JSON.stringify(schedule));
  localStorage.setItem("stats", JSON.stringify(stats));
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

window.onclick = function(event) {
  const modal = document.getElementById("quickAddModal");
  if (!event.target.closest(".fab") && !event.target.closest(".quick-add-modal")) {
    modal.style.display = "none";
  }
};
