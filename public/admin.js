console.log('admin.js loaded');

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOGIN --------------------------------------------------
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      const res  = await fetch('/api/admin/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminLoggedIn','true');
        showPanel();
        loadTasks();
      } else {
        alert('❌ Неверный логин или пароль');
      }
    });
  }

  // ---- ADD TASK -----------------------------------------------
  const addTaskForm = document.getElementById('add-task-form');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newTask').value.trim();
      if (!name) return;

      await fetch('/api/admin/addtask', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name })
      });
      document.getElementById('newTask').value = '';
      loadTasks();
    });
  }

  // ---- LISTENERS ДЛЯ СПИСКА -----------------------------------
  const tasksList = document.getElementById('tasks-list');
  if (tasksList) {
    tasksList.addEventListener('click', async (e) => {
      const delId = e.target.dataset.del;
      if (delId){
        await fetch('/api/admin/tasks',{
          method:'DELETE',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id: delId })
        });
        loadTasks();
      }
    });

    tasksList.addEventListener('change', async e => {
      if (e.target.type === 'checkbox') {
        const id = e.target.dataset.id;
        const completed = e.target.checked;
        await fetch('/api/admin/tasks',{
          method:'PUT',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id, completed })
        });
      }
    });
  }

  // при перезагрузке показываем правильный блок
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    showPanel();
    loadTasks();
  } else {
    showLogin();
  }
});
