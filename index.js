const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const dueDate = document.getElementById('due-date');
  const priority = document.getElementById('priority');

  // Load tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
      todoList.innerHTML = '';
      tasks.forEach((task, index) => {
          const priorityColors = {
              low: 'success',
              medium: 'warning',
              high: 'danger'
          };

          const taskElement = document.createElement('div');
          taskElement.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center`;
          
          const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
          
          taskElement.innerHTML = `
              <div class="form-check flex-grow-1">
                  <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
                      onchange="toggleTask(${index})">
                  <label class="form-check-label ${task.completed ? 'text-decoration-line-through' : ''}">
                      ${task.text}
                  </label>
              </div>
              <div class="d-flex align-items-center">
                  <span class="badge bg-${priorityColors[task.priority]} me-2">${task.priority}</span>
                  <small class="text-${isOverdue ? 'danger' : 'muted'} me-3">${task.dueDate}</small>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${index})">
                      <i class="bi bi-trash"></i>
                  </button>
              </div>
          `;
          todoList.appendChild(taskElement);
      });
  }

  // Add to window object to make functions available to inline onclick handlers
  window.toggleTask = (index) => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
  };

  window.deleteTask = (index) => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
  };

  todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (todoInput.value.trim()) {
          tasks.push({
              text: todoInput.value.trim(),
              completed: false,
              dueDate: dueDate.value || 'No due date',
              priority: priority.value,
              createdAt: new Date().toISOString()
          });
          
          saveTasks();
          renderTasks();
          todoInput.value = '';
          dueDate.value = '';
      }
  });

  // Initial render
  renderTasks();
});
