document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
  
      // 🔥 ЭТО ГЛАВНОЕ
      if (data.success === true) {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
      } else {
        alert('❌ Неверный логин или пароль!');
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      alert('⚠️ Ошибка входа на сервере');
    }
  });
  
  