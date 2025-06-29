const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const filterButtons = document.getElementById('filterButtons');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

let tasks = [];
let currentFilter = 'all';

// Fetch tasks from json-server
async function fetchTasks() {
  try {
    const res = await fetch('http://localhost:3000/tasks');
    tasks = await res.json();
    renderTasks();
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}


function renderTasks() {
  let filteredTasks = tasks;
  if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.completed);
  } else if (currentFilter === 'pending') {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <li data-id="${task.id}">
      <input type="checkbox" class="completeCheckbox" ${task.completed ? 'checked' : ''}>
      <strong>${task.title}</strong>: ${task.description}
      <button class="deleteBtn">Delete</button>
    </li>
  `).join('');
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTask = {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    completed: false
  };

  try {
    const res = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    const createdTask = await res.json();
    tasks.push(createdTask);
    renderTasks();
    taskForm.reset();
  } catch (error) {
    console.error('Error adding task:', error);
  }
});


taskList.addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains('completeCheckbox')) {
    const completed = e.target.checked;
    try {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      const task = tasks.find(t => t.id == id);
      if (task) task.completed = completed;
      renderTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  if (e.target.classList.contains('deleteBtn')) {
    try {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE'
      });
      tasks = tasks.filter(t => t.id != id);
      renderTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }
});


filterButtons.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    currentFilter = e.target.dataset.filter;
    renderTasks();
  }
});

// Toggle dark mode
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});


fetchTasks();
