//----------------------------------------------------
//  app.js   (для index.html – публичная страница)
//----------------------------------------------------

const tasksList  = document.getElementById('tasks-list');
const searchInput = document.getElementById('search');
let tasks = [];

/* ────────── Загрузка задач из БД ────────── */
async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error(await res.text());
    tasks = await res.json();
    displayTasks(tasks);
  } catch (err) {
    console.error('Load tasks error:', err);
    alert('⚠️ Не удалось загрузить список задач');
  }
}

/* ────────── Отображение списка ────────── */
function displayTasks(list) {
  tasksList.innerHTML = list.map(t => `
    <li>
      <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}">
      <span>${t.name}</span>
    </li>
  `).join('');
}

/* ────────── Поиск ────────── */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  const filtered = tasks.filter(t => t.name.toLowerCase().includes(q));
  displayTasks(filtered);
});

/* ────────── Изменение статуса задачи (с сохранением) ────────── */
tasksList.addEventListener('change', async (e) => {
  if (e.target.type === 'checkbox') {
    const id        = e.target.dataset.id;
    const completed = e.target.checked;

    // локально обновляем для мгновенного UI
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = completed;

    // сохраняем изменение через API
    try {
      await fetch('/api/admin/tasks', {
        method : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ id, completed })
      });
    } catch (err) {
      console.error('Save status error:', err);
      alert('⚠️ Не удалось сохранить отметку задачи');
    }
  }
});

/* ────────── Старт ────────── */
document.addEventListener('DOMContentLoaded', loadTasks);
