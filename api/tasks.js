import db from './firebase';
import { ref, get } from 'firebase/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await get(ref(db, 'tasks'));

      const data = snapshot.val() || {};
      const tasks = Object.entries(data).map(([id, task]) => ({
        id,
        ...task
      }));

      res.status(200).json(tasks);
    } catch (err) {
      console.error('DB ERROR:', err);
      res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
