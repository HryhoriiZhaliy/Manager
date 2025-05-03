import db from '../firebase';
import { ref, update, remove } from 'firebase/database';

/**
 * PUT    ➜  обновить имя и/или completed
 * DELETE ➜  удалить задачу
 * Body: { id, name?, completed? }
 */
export default async function handler(req, res) {
  const { id, name, completed } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Task ID required' });
  }

  const taskRef = ref(db, `tasks/${id}`);

  try {
    if (req.method === 'PUT') {
      const payload = {};
      if (name !== undefined)      payload.name      = name;
      if (completed !== undefined) payload.completed = completed;

      await update(taskRef, payload);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      await remove(taskRef);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ success:false, error: err.message });
  }
}
