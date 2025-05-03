import db from '../firebase';
import { ref, push } from 'firebase/database';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;

    try {
      const tasksRef = ref(db, 'tasks');
      const newTaskRef = await push(tasksRef, {
        name,
        completed: false
      });

      res.status(200).json({ success: true, id: newTaskRef.key });
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
