if (!localStorage.getItem('adminLoggedIn')) {
    window.location.href = '/admin.html';
  }
  


const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');

async function fetchTasks() {
  const response = await fetch('/api/tasks');
  const tasks = await response.json();
  tasksList.innerHTML = tasks.map(task => `<li>${task.name}</li>`).join('');
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const taskName = document.getElementById('task').value;
  await fetch('/api/admin/addtask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: taskName })
  });
  fetchTasks();
});

fetchTasks();