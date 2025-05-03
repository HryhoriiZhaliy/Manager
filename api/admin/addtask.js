import { collection, addDoc } from "firebase/firestore";
import db from "../firebase";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        name,
        completed: false,
        createdAt: new Date()
      });
      res.status(200).json({ id: docRef.id, success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
