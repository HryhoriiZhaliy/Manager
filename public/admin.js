//---------------------------------------------------------------
//  admin.js  —  единая страница: форма логина + панель задач
//---------------------------------------------------------------

console.log('admin.js loaded');

/* ──────────────────────────────────────────────────────────── */
/* UI‑переключатели                                            */
/* ──────────────────────────────────────────────────────────── */
function showLogin() {
  const loginBox  = document.getElementById('login-container');
  const panelBox  = document.getElementById('panel-container');
  if (loginBox && panelBox) {
    loginBox.style.display  = 'block';
    panelBox.style.display  = 'none';
  }
}

function showPanel() {
  const loginBox  = document.getElementById('login-container');
  const panelBox  = document.getElementById('panel-container');
  if (loginBox && panelBox) {
    loginBox.style.display  = 'none';
    panelBox.style.display  = 'block';
  }
}

/* ──────────────────────────────────────────────────────────── */
/* Главная инициализация после загрузки DOM                    */
/* ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Проверяем, залогинен ли админ ------------- */
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    showPanel();
    loadTasks();
  } else {
    showLogin();
  }

  /* ---------- 2. Обработчик формы входа -------------------- */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const res  = await fetch('/api/admin/login', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('adminLoggedIn', 'true');
          showPanel();
          loadTasks();
        } else {
          alert('❌ Неверный логин или пароль');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('⚠️ Ошибка соединения с сервером');
      }
    });
  }

  /* ---------- 3. Обработчик добавления задачи -------------- */
  const addTaskForm = document.getElementById('add-task-form');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('newTask');
      const name = nameInput.value.trim();
      if (!name) return;

      await fetch('/api/admin/addtask', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ name })
      });

      nameInput.value = '';
      loadTasks();
    });
  }

  /* ---------- 4. Список задач: отметить или удалить -------- */
  const tasksList = document.getElementById('tasks-list');
  if (tasksList) {

    // Удаление
    tasksList.addEventListener('click', async (e) => {
      const delId = e.target.dataset.del;
      if (delId) {
        await fetch('/api/admin/tasks', {
          method : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ id: delId })
        });
        loadTasks();
      }
    });

    // Отметка «выполнено»
    tasksList.addEventListener('change', async (e) => {
      if (e.target.type === 'checkbox') {
        const id        = e.target.dataset.id;
        const completed = e.target.checked;
        await fetch('/api/admin/tasks', {
          method : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ id, completed })
        });
      }
    });
  }
});

/* ──────────────────────────────────────────────────────────── */
/* Загрузка и вывод списка задач                               */
/* ──────────────────────────────────────────────────────────── */
async function loadTasks() {
  try {
    const res   = await fetch('/api/tasks');
    const tasks = await res.json();

    const ul = document.getElementById('tasks-list');
    ul.innerHTML = tasks.map(t => `
      <li>
        <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}">
        <span>${t.name}</span>
        <button data-del="${t.id}" style="margin-left:auto">🗑️</button>
      </li>
    `).join('');
  } catch (err) {
    console.error('Load tasks error:', err);
    alert('⚠️ Не удалось загрузить список задач');
  }
}
