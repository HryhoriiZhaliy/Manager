// --- состояние авторизации ---
const isLoggedIn = () => localStorage.getItem('adminLoggedIn') === 'true';

// --- DOM ---
const loginBox   = document.getElementById('login-container');
const panelBox   = document.getElementById('panel-container');
const tasksList  = document.getElementById('tasks-list');

// ----- 1. ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ----------------------------------
window.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    showPanel();
    loadTasks();
  } else {
    showLogin();
  }
});

// ----- 2. ЛОГИН ---------------------------------------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // запрос к API
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

// ----- 3. ДОБАВЛЕНИЕ ЗАДАЧИ --------------------------------------
document.getElementById('add-task-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('newTask').value.trim();
  if (!name) return;

  await fetch('/api/admin/addtask',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name })
  });
  document.getElementById('newTask').value='';
  loadTasks();
});

// ----- 4. ЗАГРУЗКА / ОТОБРАЖЕНИЕ ЗАДАЧ ---------------------------
async function loadTasks(){
  const res   = await fetch('/api/tasks');
  const tasks = await res.json();

  tasksList.innerHTML = tasks.map(t=>`
    <li>
      <input type="checkbox" ${t.completed?'checked':''} data-id="${t.id}">
      <span>${t.name}</span>
      <button data-del="${t.id}" style="margin-left:auto">🗑️</button>
    </li>`).join('');
}

// ----- 5. ОБНОВЛЕНИЕ / УДАЛЕНИЕ ----------------------------------
tasksList.addEventListener('click', async e=>{
  const delId = e.target.dataset.del;
  if (delId){
    await fetch('/api/admin/tasks',{ method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:delId })});
    loadTasks();
  }
});

tasksList.addEventListener('change', async e=>{
  if (e.target.type==='checkbox'){
    const id  = e.target.dataset.id;
    const completed = e.target.checked;
    await fetch('/api/admin/tasks',{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id, completed })
    });
  }
});

// ----- UI-переключатели ------------------------------------------
function showLogin(){
  loginBox.style.display = 'block';
  panelBox.style.display = 'none';
}
function showPanel(){
  loginBox.style.display = 'none';
  panelBox.style.display = 'block';
}
