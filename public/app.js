const tasksList = document.getElementById('tasks-list');
const searchInput = document.getElementById('search');
let tasks = [];

// Загрузка задач из базы
async function loadTasks() {
  const res = await fetch('/api/tasks');
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Server error:", text);
    return;
  }

  tasks = await res.json();
  displayTasks(tasks);
}

// Отображение задач
function displayTasks(tasksToDisplay) {
  tasksList.innerHTML = tasksToDisplay.map(task => `
    <li>
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
      <span>${task.name}</span>
    </li>
  `).join('');
}

// Поиск задач
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(query));
  displayTasks(filteredTasks);
});

// Отметка задач как выполненных (только визуально)
tasksList.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') {
    const taskId = e.target.dataset.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = e.target.checked;
    }
  }
});

document.addEventListener('DOMContentLoaded', loadTasks);
