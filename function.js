document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const dueDate = document.getElementById('due-date');
    const priority = document.getElementById('priority');

    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks(filterType = 'all') {
        todoList.innerHTML = '';
        let filteredTasks = tasks;

        switch(filterType) {
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'overdue':
                filteredTasks = tasks.filter(task => 
                    new Date(task.dueDate) < new Date() && !task.completed
                );
                break;
        }

        filteredTasks.forEach((task, index) => {
            const priorityColors = {
                low: 'success',
                medium: 'warning',
                high: 'danger'
            };

            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

            const taskElement = document.createElement('div');
            taskElement.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isOverdue ? 'border-danger' : ''}`;

            taskElement.innerHTML = `
                <div class="form-check flex-grow-1">
                    <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label ${task.completed ? 'text-decoration-line-through' : ''}">
                        ${task.text}
                    </label>
                </div>
                <div class="d-flex align-items-center">
                    <span class="badge bg-${priorityColors[task.priority]} me-2">${task.priority}</span>
                    <small class="text-${isOverdue ? 'danger' : 'muted'} me-3">${task.dueDate || 'No due date'}</small>
                    <button class="btn btn-sm btn-outline-primary me-1 edit-btn">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

            const checkbox = taskElement.querySelector('.form-check-input');
            checkbox.addEventListener('change', () => toggleTask(index));

            const editBtn = taskElement.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => editTask(index));

            const deleteBtn = taskElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(index));

            todoList.appendChild(taskElement);
        });
    }

    
    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function editTask(index) {
        const newText = prompt('Edit task:', tasks[index].text);
        if (newText && newText.trim()) {
            tasks[index].text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(index) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    }

    
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        
        if (text) {
            tasks.push({
                text,
                completed: false,
                dueDate: dueDate.value || null,
                priority: priority.value,
                createdAt: new Date().toISOString()
            });
            
            saveTasks();
            renderTasks();
            todoForm.reset();
        }
    });

    document.getElementById('show-all').addEventListener('click', () => renderTasks('all'));
    document.getElementById('show-active').addEventListener('click', () => renderTasks('active'));
    document.getElementById('show-completed').addEventListener('click', () => renderTasks('completed'));
    document.getElementById('show-overdue').addEventListener('click', () => renderTasks('overdue'));
    
    document.getElementById('clear-completed').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    });

    renderTasks();
});
