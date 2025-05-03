// Admin panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const addTaskForm = document.getElementById('add-task-form');
    const addTaskError = document.getElementById('add-task-error');
    const adminTasksList = document.getElementById('admin-tasks-list');
    const adminTaskTemplate = document.getElementById('admin-task-template');
    const editModalTemplate = document.getElementById('edit-modal-template');
    
    // Check if admin is already logged in
    checkAdminAuth();
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    addTaskForm.addEventListener('submit', handleAddTask);

    // Functions
    async function checkAdminAuth() {
        try {
            const response = await fetch('/api/admin/orders');
            
            if (response.ok) {
                // User is authenticated
                showAdminDashboard();
                loadAdminTasks();
            } else {
                // User is not authenticated
                showLoginForm();
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            showLoginForm();
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showLoginError('Please enter both username and password');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAdminDashboard();
                loadAdminTasks();
            } else {
                showLoginError('Invalid username or password');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            showLoginError('An error occurred while logging in. Please try again.');
        }
    }

    async function handleAddTask(e) {
        e.preventDefault();
        
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        
        if (!title || !description) {
            showAddTaskError('Please enter both title and description');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Clear form
                addTaskForm.reset();
                hideAddTaskError();
                
                // Reload tasks
                loadAdminTasks();
            } else {
                showAddTaskError(data.message || 'Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            showAddTaskError('An error occurred while adding the task. Please try again.');
        }
    }

    async function loadAdminTasks() {
        try {
            adminTasksList.innerHTML = '<div class="loading">Loading tasks...</div>';
            
            const response = await fetch('/api/admin/orders');
            
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const data = await response.json();
            
            if (data.success) {
                displayAdminTasks(data.tasks);
            } else {
                showAdminTasksError(data.message || 'Error loading tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            showAdminTasksError('Failed to load tasks. Please try again later.');
        }
    }

    async function handleDeleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/orders?id=${taskId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove the task from the DOM
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.remove();
                }
                
                // If no tasks left, show message
                if (adminTasksList.children.length === 0) {
                    adminTasksList.innerHTML = '<div class="no-tasks">No tasks found.</div>';
                }
            } else {
                alert(data.message || 'Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('An error occurred while deleting the task. Please try again.');
        }
    }

    function handleEditTask(task) {
        // Create modal from template
        const modalClone = document.importNode(editModalTemplate.content, true);
        document.body.appendChild(modalClone);
        
        // Get modal elements
        const modalOverlay = document.querySelector('.modal-overlay');
        const editForm = document.getElementById('edit-task-form');
        const titleInput = document.getElementById('edit-task-title');
        const descriptionInput = document.getElementById('edit-task-description');
        const completedCheckbox = document.getElementById('edit-task-completed');
        const cancelButton = document.getElementById('cancel-edit');
        const errorElement = document.getElementById('edit-task-error');
        
        // Fill form with task data
        titleInput.value = task.title;
        descriptionInput.value = task.description;
        completedCheckbox.checked = task.completed;
        
        // Add event listeners
        cancelButton.addEventListener('click', () => {
            modalOverlay.remove();
        });
        
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedTask = {
                id: task.id,
                title: titleInput.value.trim(),
                description: descriptionInput.value.trim(),
                completed: completedCheckbox.checked
            };
            
            if (!updatedTask.title || !updatedTask.description) {
                errorElement.textContent = 'Please enter both title and description';
                errorElement.classList.remove('hidden');
                return;
            }
            
            try {
                const response = await fetch('/api/admin/orders', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedTask)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    modalOverlay.remove();
                    loadAdminTasks();
                } else {
                    errorElement.textContent = data.message || 'Failed to update task';
                    errorElement.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error updating task:', error);
                errorElement.textContent = 'An error occurred while updating the task. Please try again.';
                errorElement.classList.remove('hidden');
            }
        });
    }

    function displayAdminTasks(tasks) {
        // Clear the tasks list
        adminTasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            const noTasksDiv = document.createElement('div');
            noTasksDiv.classList.add('no-tasks');
            noTasksDiv.textContent = 'No tasks found.';
            adminTasksList.appendChild(noTasksDiv);
            return;
        }
        
        // Sort tasks by creation date (newest first)
        tasks.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0;
            const dateB = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0;
            return dateB - dateA;
        });
        
        // Create a document fragment to improve performance
        const fragment = document.createDocumentFragment();
        
        tasks.forEach(task => {
            const taskElement = createAdminTaskElement(task);
            fragment.appendChild(taskElement);
        });
        
        adminTasksList.appendChild(fragment);
    }

    function createAdminTaskElement(task) {
        const taskClone = document.importNode(adminTaskTemplate.content, true);
        const taskElement = taskClone.querySelector('.task-item');
        
        // Set task data attributes
        taskElement.setAttribute('data-task-id', task.id);
        taskElement.classList.toggle('completed', task.completed);
        
        // Set task content
        taskElement.querySelector('.task-title').textContent = task.title;
        taskElement.querySelector('.task-description').textContent = task.description;
        
        // Set task date
        const dateElement = taskElement.querySelector('.task-date');
        if (task.createdAt) {
            // Format date
            const date = task.createdAt.seconds
                ? new Date(task.createdAt.seconds * 1000)
                : new Date(task.createdAt);
                
            dateElement.textContent = date.toLocaleDateString();
        } else {
            dateElement.textContent = 'No date';
        }
        
        // Set task status
        const statusText = taskElement.querySelector('.status-text');
        statusText.textContent = task.completed ? 'Completed' : 'Pending';
        
        // Add event listeners to buttons
        const editButton = taskElement.querySelector('.edit-task-btn');
        const deleteButton = taskElement.querySelector('.delete-task-btn');
        
        editButton.addEventListener('click', () => handleEditTask(task));
        deleteButton.addEventListener('click', () => handleDeleteTask(task.id));
        
        return taskElement;
    }

    function showLoginForm() {
        loginSection.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }

    function showAdminDashboard() {
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
    }

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }

    function showAddTaskError(message) {
        addTaskError.textContent = message;
        addTaskError.classList.remove('hidden');
    }

    function hideAddTaskError() {
        addTaskError.classList.add('hidden');
    }

    function showAdminTasksError(message) {
        adminTasksList.innerHTML = `<div class="error">${message}</div>`;
    }
});