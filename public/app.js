const tasksList = document.getElementById('tasks-list');

async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  tasksList.innerHTML = tasks.map(task => 
    `<li>${task.name} <input type="checkbox" ${task.completed ? 'checked' : ''}></li>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', loadTasks);