document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  
    const data = await response.json();
  
    if (data.success) {
      localStorage.setItem('adminLoggedIn', true);
      window.location.href = 'admin.html';
    } else {
      alert('Incorrect username or password!');
    }
  });
  