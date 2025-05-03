import db from '../firebase';
import { ref, update, remove } from 'firebase/database';

export default async function handler(req, res) {
  const { id, name, completed } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Task ID is required' });
  }

  const taskRef = ref(db, `tasks/${id}`);

  try {
    if (req.method === 'PUT') {
      await update(taskRef, { name, completed });
      res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      await remove(taskRef);
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Task update/delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
