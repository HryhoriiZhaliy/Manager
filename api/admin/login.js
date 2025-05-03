export default function handler(req, res) {
    const { username, password } = req.body;
    
    if (
      username === process.env.ADMIN_USER && 
      password === process.env.ADMIN_PASS
    ) {
      // Creating a simple session token (in production use proper JWT or session management)
      const token = Buffer.from(`${username}:${new Date().getTime()}`).toString('base64');
      
      // Set cookie and return success
      res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; Max-Age=3600`);
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  }