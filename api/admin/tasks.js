import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import db from "../firebase";

export default async function handler(req, res) {
  const { id, name, completed } = req.body;

  if (req.method === 'PUT') {
    try {
      await updateDoc(doc(db, "tasks", id), {
        name,
        completed
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteDoc(doc(db, "tasks", id));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
