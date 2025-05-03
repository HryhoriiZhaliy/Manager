// Main application JavaScript for public users

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tasksList = document.getElementById('tasks-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const taskTemplate = document.getElementById('task-template');

    // Event listeners
    searchButton.addEventListener('click', searchTasks);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchTasks();
        }
    });

    // Load tasks on page load
    loadTasks();

    // Functions
    async function loadTasks() {
        try {
            showLoading();
            const response = await fetch('/api/order');
            
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const data = await response.json();
            
            if (data.success) {
                displayTasks(data.tasks);
            } else {
                showError(data.message || 'Error loading tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            showError('Failed to load tasks. Please try again later.');
        }
    }

    async function searchTasks() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            loadTasks();
            return;
        }
        
        try {
            showLoading();
            const response = await fetch(`/api/order?search=${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) {
                throw new Error('Failed to search tasks');
            }
            
            const data = await response.json();
            
            if (data.success) {
                displayTasks(data.tasks);
            } else {
                showError(data.message || 'Error searching tasks');
            }
        } catch (error) {
            console.error('Error searching tasks:', error);
            showError('Failed to search tasks. Please try again later.');
        }
    }

    async function markTaskAsCompleted(taskId, completed) {
        try {
            const response = await fetch('/api/order', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: taskId,
                    completed
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Update the UI to reflect the change
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    const statusText = taskElement.querySelector('.status-text');
                    statusText.textContent = completed ? 'Completed' : 'Pending';
                    taskElement.classList.toggle('completed', completed);
                }
            } else {
                showError(data.message || 'Error updating task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            showError('Failed to update task. Please try again later.');
        }
    }

    function displayTasks(tasks) {
        // Clear the tasks list
        tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            const noTasksDiv = document.createElement('div');
            noTasksDiv.classList.add('no-tasks');
            noTasksDiv.textContent = 'No tasks found.';
            tasksList.appendChild(noTasksDiv);
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
            const taskElement = createTaskElement(task);
            fragment.appendChild(taskElement);
        });
        
        tasksList.appendChild(fragment);
    }

    function createTaskElement(task) {
        const taskClone = document.importNode(taskTemplate.content, true);
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
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.checked = task.completed;
        const statusText = taskElement.querySelector('.status-text');
        statusText.textContent = task.completed ? 'Completed' : 'Pending';
        
        // Add event listener to checkbox
        checkbox.addEventListener('change', (e) => {
            markTaskAsCompleted(task.id, e.target.checked);
        });
        
        return taskElement;
    }

    function showLoading() {
        tasksList.innerHTML = '<div class="loading">Loading tasks...</div>';
    }

    function showError(message) {
        tasksList.innerHTML = `<div class="error">${message}</div>`;
    }
});