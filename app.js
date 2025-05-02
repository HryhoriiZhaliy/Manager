/**
 * Frontend aplikace pro správu úkolů
 */
class TaskManager {
    constructor(backend) {
      this.backend = backend;
      
      // Reference na HTML elementy
      this.taskList = document.getElementById('task-list');
      this.newTaskInput = document.getElementById('new-task');
      this.addButton = document.getElementById('add-button');
      this.errorContainer = document.getElementById('error-container');
      this.loadingIndicator = document.getElementById('loading');
      this.noTasksMessage = document.getElementById('no-tasks-message');
      
      // Šablony
      this.taskTemplate = document.getElementById('task-template');
      this.editTemplate = document.getElementById('edit-template');
      
      // Editace úkolu - ID aktuálně editovaného úkolu
      this.editingTaskId = null;
      
      // Inicializace událostí
      this.setupEventListeners();
      
      // Načtení úkolů
      this.loadTasks();
    }
    
    // Nastavení event listenerů
    setupEventListeners() {
      // Přidání nového úkolu
      this.addButton.addEventListener('click', () => this.addTask());
      this.newTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.addTask();
        }
      });
    }
    
    // Zobrazení chybové zprávy
    showError(message) {
      this.errorContainer.textContent = message;
      this.errorContainer.classList.remove('hidden');
      
      // Automatické skrytí chyby po 5 sekundách
      setTimeout(() => {
        this.errorContainer.classList.add('hidden');
      }, 5000);
    }
    
    // Zobrazení načítání
    showLoading(isLoading = true) {
      if (isLoading) {
        this.loadingIndicator.classList.remove('hidden');
      } else {
        this.loadingIndicator.classList.add('hidden');
      }
    }
    
    // Načtení úkolů z backendu
    async loadTasks() {
      try {
        this.showLoading(true);
        
        const tasks = await this.backend.getAllTasks();
        this.renderTasks(tasks);
        
      } catch (error) {
        this.showError(`Chyba při načítání úkolů: ${error.message}`);
        console.error('Chyba při načítání úkolů:', error);
      } finally {
        this.showLoading(false);
      }
    }
    
    // Vykreslení seznamu úkolů
    renderTasks(tasks) {
      // Vyčištění seznamu
      this.taskList.innerHTML = '';
      
      // Zobrazení zprávy, pokud nejsou žádné úkoly
      if (tasks.length === 0) {
        this.noTasksMessage.classList.remove('hidden');
      } else {
        this.noTasksMessage.classList.add('hidden');
        
        // Přidání úkolů do seznamu
        tasks.forEach(task => {
          const taskElement = this.createTaskElement(task);
          this.taskList.appendChild(taskElement);
        });
      }
    }
    
    // Vytvoření HTML elementu pro úkol
    createTaskElement(task) {
      // Použití šablony pro vytvoření nového elementu
      const taskClone = this.taskTemplate.content.cloneNode(true);
      const taskItem = taskClone.querySelector('.task-item');
      const taskText = taskClone.querySelector('.task-text');
      const taskCheckbox = taskClone.querySelector('.task-checkbox');
      const editButton = taskClone.querySelector('.edit-button');
      const deleteButton = taskClone.querySelector('.delete-button');
      
      // Nastavení dat a vzhledu
      taskItem.dataset.id = task.id;
      taskText.textContent = task.title;
      taskCheckbox.checked = task.completed;
      
      if (task.completed) {
        taskText.classList.add('task-completed');
      }
      
      // Event listenery
      taskCheckbox.addEventListener('change', () => this.toggleTaskCompletion(task.id, !task.completed));
      editButton.addEventListener('click', () => this.startEditing(task));
      deleteButton.addEventListener('click', () => this.deleteTask(task.id));
      
      return taskItem;
    }
    
    // Přidání nového úkolu
    async addTask() {
      const title = this.newTaskInput.value.trim();
      
      if (!title) {
        return;
      }
      
      try {
        this.showLoading(true);
        
        const newTask = await this.backend.createTask(title);
        
        // Vyčištění vstupního pole
        this.newTaskInput.value = '';
        
        // Načtení aktualizovaného seznamu
        await this.loadTasks();
        
      } catch (error) {
        this.showError(`Chyba při vytváření úkolu: ${error.message}`);
        console.error('Chyba při vytváření úkolu:', error);
      } finally {
        this.showLoading(false);
      }
    }
    
    // Přepnutí stavu dokončení úkolu
    async toggleTaskCompletion(taskId, completed) {
      try {
        await this.backend.updateTask(taskId, { completed });
        
        // Aktualizace zobrazení bez načítání celého seznamu
        const taskItem = this.taskList.querySelector(`[data-id="${taskId}"]`);
        const taskText = taskItem.querySelector('.task-text');
        
        if (completed) {
          taskText.classList.add('task-completed');
        } else {
          taskText.classList.remove('task-completed');
        }
        
      } catch (error) {
        this.showError(`Chyba při aktualizaci úkolu: ${error.message}`);
        console.error('Chyba při aktualizaci úkolu:', error);
        
        // Vrátit checkbox do původního stavu
        await this.loadTasks();
      }
    }
    
    // Zahájení editace úkolu
    startEditing(task) {
      // Zabránění editaci více úkolů najednou
      if (this.editingTaskId !== null) {
        this.cancelEditing();
      }
      
      const taskItem = this.taskList.querySelector(`[data-id="${task.id}"]`);
      const taskContent = taskItem.querySelector('.task-content');
      const taskActions = taskItem.querySelector('.task-actions');
      
      // Uložení původního obsahu
      this.originalContent = taskContent.cloneNode(true);
      this.originalActions = taskActions.cloneNode(true);
      
      // Vytvoření editačního formuláře ze šablony
      const editClone = this.editTemplate.content.cloneNode(true);
      const editInput = editClone.querySelector('.edit-input');
      const saveButton = editClone.querySelector('.save-button');
      const cancelButton = editClone.querySelector('.cancel-button');
      
      // Nastavení hodnoty a event listenerů
      editInput.value = task.title;
      saveButton.addEventListener('click', () => this.saveEdit(task.id, editInput.value));
      cancelButton.addEventListener('click', () => this.cancelEditing());
      
      // Event listener pro klávesové zkratky
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.saveEdit(task.id, editInput.value);
        } else if (e.key === 'Escape') {
          this.cancelEditing();
        }
      });
      
      // Nahrazení obsahu
      taskContent.replaceWith(editClone);
      taskActions.innerHTML = '';
      
      // Nastavení fokus na vstupní pole
      setTimeout(() => {
        taskItem.querySelector('.edit-input').focus();
      }, 0);
      
      // Uložení ID editovaného úkolu
      this.editingTaskId = task.id;
    }
    
    // Uložení editace úkolu
    async saveEdit(taskId, newTitle) {
      if (!newTitle.trim()) {
        return;
      }
      
      try {
        this.showLoading(true);
        
        await this.backend.updateTask(taskId, { title: newTitle.trim() });
        
        // Načtení aktualizovaného seznamu
        await this.loadTasks();
        
        // Reset editace
        this.editingTaskId = null;
        
      } catch (error) {
        this.showError(`Chyba při aktualizaci úkolu: ${error.message}`);
        console.error('Chyba při aktualizaci úkolu:', error);
      } finally {
        this.showLoading(false);
      }
    }
    
    // Zrušení editace
    cancelEditing() {
      if (this.editingTaskId === null) return;
      
      const taskItem = this.taskList.querySelector(`[data-id="${this.editingTaskId}"]`);
      
      if (taskItem) {
        const currentEditContainer = taskItem.querySelector('.edit-container');
        const emptyActions = taskItem.querySelector('.task-actions');
        
        // Obnovení původního obsahu
        if (currentEditContainer && this.originalContent) {
          currentEditContainer.replaceWith(this.originalContent);
        }
        
        if (emptyActions && this.originalActions) {
          emptyActions.replaceWith(this.originalActions);
        }
      }
      
      // Reset editace
      this.editingTaskId = null;
      this.originalContent = null;
      this.originalActions = null;
    }
    
    // Smazání úkolu
    async deleteTask(taskId) {
      if (!confirm('Opravdu chcete smazat tento úkol?')) {
        return;
      }
      
      try {
        this.showLoading(true);
        
        await this.backend.deleteTask(taskId);
        
        // Načtení aktualizovaného seznamu
        await this.loadTasks();
        
      } catch (error) {
        this.showError(`Chyba při mazání úkolu: ${error.message}`);
        console.error('Chyba při mazání úkolu:', error);
      } finally {
        this.showLoading(false);
      }
    }
  }
  
  // Po načtení stránky inicializovat aplikaci
  document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManager(backend);
  });