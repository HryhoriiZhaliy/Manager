document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
  
      // 🔥 Проверка только по полю success
      if (data.success === true) {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html'; // или другая страница панели
      } else {
        alert('❌ Неверный логин или пароль!');
      }
  
    } catch (err) {
      console.error('Ошибка входа:', err);
      alert('⚠️ Ошибка подключения к серверу');
    }
  });
  