//----------------------------------------------------------------
// admin.js  – форма логина + расширенная админ‑панель с CRUD
//----------------------------------------------------------------

/* ---------- UI‑переключатели ---------- */
const showLogin = () => {
  document.getElementById('login-container').style.display  = 'block';
  document.getElementById('panel-container').style.display  = 'none';
};
const showPanel = () => {
  document.getElementById('login-container').style.display  = 'none';
  document.getElementById('panel-container').style.display  = 'block';
};

/* ---------- Загрузка задач ---------- */
async function loadTasks() {
  try {
    const res   = await fetch('/api/tasks');
    const tasks = await res.json();
    renderList(tasks);
  } catch (err) {
    console.error(err);
    alert('⚠️ Не удалось загрузить задачи');
  }
}

/* ---------- Рендер списка ---------- */
function renderList(tasks) {
  const ul = document.getElementById('tasks-list');
  ul.innerHTML = tasks.map(t => `
    <li data-id="${t.id}">
      <input type="checkbox" ${t.completed ? 'checked' : ''}>
      <span class="task-name">${t.name}</span>
      <button class="edit-btn"   title="Edit">✏️</button>
      <button class="delete-btn" title="Delete">🗑️</button>
    </li>
  `).join('');
}

/* ---------- Обработчики ---------- */
document.addEventListener('DOMContentLoaded', () => {
  /* логин */
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const r = await fetch('/api/admin/login',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username,password})
    });
    const d = await r.json();
    if (d.success){ showPanel(); loadTasks(); }
    else alert('❌ Wrong credentials');
  });

  /* добавление */
  document.getElementById('add-task-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const inp = document.getElementById('newTask');
    const name = inp.value.trim();
    if(!name) return;
    await fetch('/api/admin/addtask',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name})
    });
    inp.value=''; loadTasks();
  });

  /* клики по списку */
  document.getElementById('tasks-list').addEventListener('click', async e=>{
    const li   = e.target.closest('li');
    if (!li) return;
    const id   = li.dataset.id;

    /* удалить */
    if (e.target.classList.contains('delete-btn')){
      await fetch('/api/admin/tasks',{method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id})});
      loadTasks();
    }

    /* редактировать */
    if (e.target.classList.contains('edit-btn')){
      const span = li.querySelector('.task-name');
      const newName = prompt('Edit task name', span.textContent);
      if (newName && newName.trim() && newName!==span.textContent){
        await fetch('/api/admin/tasks',{method:'PUT',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({id, name:newName.trim()})});
        loadTasks();
      }
    }
  });

  /* отметить выполнено */
  document.getElementById('tasks-list').addEventListener('change', async e=>{
    if (e.target.type==='checkbox'){
      const li = e.target.closest('li');
      const id = li.dataset.id;
      const completed = e.target.checked;
      await fetch('/api/admin/tasks',{method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id, completed})});
    }
  });

  /* выход */
  document.getElementById('logout-btn').addEventListener('click', showLogin);
});
