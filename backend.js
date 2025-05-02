/**
 * Zjednodušený backend pro správu úkolů
 * Tento kód simuluje serverové API v prohlížeči pomocí localStorage
 */
class TaskBackend {
    constructor() {
      // Inicializace úkolů z localStorage nebo použití ukázkových dat
      this.initTasks();
      
      // Simulace latence sítě pro realističtější chování
      this.SIMULATED_DELAY = 300;
    }
    
    // Inicializuje úkoly z localStorage nebo vytvoří výchozí úkoly
    initTasks() {
      const savedTasks = localStorage.getItem('tasks');
      
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
      } else {
        // Výchozí ukázkové úkoly
        this.tasks = [
          { id: 1, title: 'Nakoupit potraviny', completed: false },
          { id: 2, title: 'Zaplatit účty', completed: true },
          { id: 3, title: 'Připravit prezentaci', completed: false }
        ];
        this.saveTasks();
      }
    }
    
    // Uloží úkoly do localStorage
    saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    // Simuluje zpoždění sítě a vrátí data
    delay(data) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(data), this.SIMULATED_DELAY);
      });
    }
    
    // Simuluje chybu sítě (pro testování)
    delayError(message) {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), this.SIMULATED_DELAY);
      });
    }
    
    // API metody
    
    // GET - získat všechny úkoly
    async getAllTasks() {
      return this.delay([...this.tasks]);
    }
    
    // GET - získat úkol podle ID
    async getTaskById(id) {
      const task = this.tasks.find(task => task.id === id);
      
      if (!task) {
        return this.delayError('Úkol nenalezen');
      }
      
      return this.delay({...task});
    }
    
    // POST - vytvořit nový úkol
    async createTask(title, completed = false) {
      if (!title || title.trim() === '') {
        return this.delayError('Název úkolu je povinný');
      }
      
      // Generování nového ID
      const newId = this.tasks.length > 0 
        ? Math.max(...this.tasks.map(task => task.id)) + 1 
        : 1;
      
      const newTask = {
        id: newId,
        title: title.trim(),
        completed
      };
      
      this.tasks.push(newTask);
      this.saveTasks();
      
      return this.delay({...newTask});
    }
    
    // PUT - aktualizovat úkol
    async updateTask(id, updates) {
      const taskIndex = this.tasks.findIndex(task => task.id === id);
      
      if (taskIndex === -1) {
        return this.delayError('Úkol nenalezen');
      }
      
      // Aktualizace úkolu
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...updates
      };
      
      this.saveTasks();
      
      return this.delay({...this.tasks[taskIndex]});
    }
    
    // DELETE - smazat úkol
    async deleteTask(id) {
      const taskIndex = this.tasks.findIndex(task => task.id === id);
      
      if (taskIndex === -1) {
        return this.delayError('Úkol nenalezen');
      }
      
      const deletedTask = {...this.tasks[taskIndex]};
      this.tasks = this.tasks.filter(task => task.id !== id);
      this.saveTasks();
      
      return this.delay(deletedTask);
    }
  }
  
  // Vytvoření instance backendu pro použití v app.js
  const backend = new TaskBackend();