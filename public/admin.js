//----------------------------------------------------------------
// admin.js  –  единая страница: форма логина + админ‑панель
//              Авторизация не сохраняется: каждый визит → новая
//----------------------------------------------------------------

console.log('admin.js loaded');

/* ────────── UI‑переключатели ────────── */
function showLogin() {
  document.getElementById('login-container').style.display  = 'block';
  document.getElementById('panel-container').style.display  = 'none';
}
function showPanel() {
  document.getElementById('login-container').style.display  = 'none';
  document.getElementById('panel-container').style.display  = 'block';
}

/* ────────── Загрузка задач ────────── */
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
    alert('⚠️ Не удалось загрузить задачи');
  }
}

/* ────────── Основная инициализация ────────── */
document.addEventListener('DOMContentLoaded', () => {

  //-------------------------------------------------
  // 1. Всегда начинаем с формы логина
  //-------------------------------------------------
  showLogin();

  //-------------------------------------------------
  // 2. Логин
  //-------------------------------------------------
  const loginForm = document.getElementById('login-form');
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

  //-------------------------------------------------
  // 3. Добавление задачи
  //-------------------------------------------------
  const addForm = document.getElementById('add-task-form');
  addForm.addEventListener('submit', async (e) => {
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

  //-------------------------------------------------
  // 4. Список задач: отметить выполнено / удалить
  //-------------------------------------------------
  const tasksList = document.getElementById('tasks-list');

  // Удалить
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

  // Отметить выполнено
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

  //-------------------------------------------------
  // 5. Кнопка «Log out» (опционально)
  //-------------------------------------------------
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showLogin();                 // возвращаем форму
      document.getElementById('tasks-list').innerHTML = ''; // чистим список
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    });
  }
});
