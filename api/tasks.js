// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication functions
export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: error.message };
  }
};

// Task functions
export const addTask = async (task) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: new Date(),
      completed: false
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: error.message };
  }
};

export const getTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, tasks };
  } catch (error) {
    console.error("Error getting tasks:", error);
    return { success: false, error: error.message };
  }
};

export const updateTask = async (id, data) => {
  try {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message };
  }
};

export const deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, "tasks", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message };
  }
};

export const searchTasks = async (searchTerm) => {
  try {
    const tasksRef = collection(db, "tasks");
    // Note: This is a simple implementation. For proper text search,
    // consider using Firebase's indexing capabilities or a dedicated search service
    const q = query(tasksRef, where("title", ">=", searchTerm), where("title", "<=", searchTerm + '\uf8ff'));
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, tasks };
  } catch (error) {
    console.error("Error searching tasks:", error);
    return { success: false, error: error.message };
  }
};

export default {
  db,
  auth,
  loginAdmin,
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  searchTasks
};