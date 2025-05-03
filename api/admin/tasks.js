// This file replaces orders.js as mentioned in the requirements

import { getTasks, updateTask, deleteTask } from '../firebase';

export default async function handler(req, res) {
  // Check if user is authenticated as admin
  const adminToken = req.cookies.admin_token;
  if (!adminToken) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // GET - retrieve all tasks
  if (req.method === 'GET') {
    try {
      const result = await getTasks();
      
      if (result.success) {
        res.status(200).json({ success: true, tasks: result.tasks });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error("Error retrieving tasks:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // PUT - update a task
  else if (req.method === 'PUT') {
    try {
      const { id, ...taskData } = req.body;
      
      if (!id) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
      }

      const result = await updateTask(id, taskData);
      
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // DELETE - delete a task
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
      }

      const result = await deleteTask(id);
      
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}