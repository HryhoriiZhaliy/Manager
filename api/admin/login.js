export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
  
    try {
      // Получаем тело запроса (для Vercel и Next.js req.body уже объект)
      const { username, password } = req.body;
  
      if (
        username === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASS
      ) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ success: false });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
  