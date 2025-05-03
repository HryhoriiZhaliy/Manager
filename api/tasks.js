import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import db from "./firebase";

// Получение всех задач
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

};