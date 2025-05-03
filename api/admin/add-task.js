// This file replaces add-product.js as mentioned in the requirements

import { addTask } from '../firebase';

export default async function handler(req, res) {
  // Check if user is authenticated as admin
  const adminToken = req.cookies.admin_token;
  if (!adminToken) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const taskData = req.body;
    // Validate task data
    if (!taskData.title || !taskData.description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await addTask(taskData);
    
    if (result.success) {
      res.status(201).json({ success: true, taskId: result.id });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}