// Integration utilities to ensure data consistency across the entire application

export class DataSyncManager {
  private static instance: DataSyncManager;
  private listeners: Set<() => void> = new Set();
  private debounceTimeout: NodeJS.Timeout | null = null;

  static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  // Register a component for sync notifications
  register(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all registered components of data changes
  notifyAll() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = setTimeout(() => {
      this.listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in sync callback:', error);
        }
      });
    }, 50); // 50ms debounce
  }

  // Force immediate sync without debounce
  forceSync() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in force sync callback:', error);
      }
    });
  }

  // Clear all listeners
  clear() {
    this.listeners.clear();
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }
}

// Global event dispatcher for cross-component communication
export const globalEventBus = {
  emit: (eventName: string, data: any = null) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  },

  on: (eventName: string, callback: (event: CustomEvent) => void) => {
    window.addEventListener(eventName, callback as EventListener);
    return () => window.removeEventListener(eventName, callback as EventListener);
  },

  // Specific events for our application
  dataUpdated: (type: 'project' | 'task' | 'comment', data: any) => {
    globalEventBus.emit('app:dataUpdated', { type, data, timestamp: Date.now() });
  },

  projectUpdated: (project: any) => {
    globalEventBus.emit('app:projectUpdated', { project, timestamp: Date.now() });
  },

  taskUpdated: (task: any) => {
    globalEventBus.emit('app:taskUpdated', { task, timestamp: Date.now() });
  },

  statusChanged: (taskId: number, oldStatus: string, newStatus: string) => {
    globalEventBus.emit('app:statusChanged', { 
      taskId, 
      oldStatus, 
      newStatus, 
      timestamp: Date.now() 
    });
  },

  commentAdded: (taskId: number, comment: any) => {
    globalEventBus.emit('app:commentAdded', { 
      taskId, 
      comment, 
      timestamp: Date.now() 
    });
  }
};

// Utility to ensure localStorage consistency
export const ensureStorageConsistency = () => {
  try {
    const projects = JSON.parse(localStorage.getItem('construction_projects') || '[]');
    const tasks = JSON.parse(localStorage.getItem('construction_tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('construction_users') || '[]');
    const comments = JSON.parse(localStorage.getItem('construction_comments') || '[]');

    // Validate data integrity
    const validProjects = projects.filter((p: any) => p && p.id);
    const validTasks = tasks.filter((t: any) => t && t.id && t.projectId);
    const validUsers = users.filter((u: any) => u && u.id && u.email);
    const validComments = comments.filter((c: any) => c && c.id);

    // Re-save if any validation occurred
    if (validProjects.length !== projects.length ||
        validTasks.length !== tasks.length ||
        validUsers.length !== users.length ||
        validComments.length !== comments.length) {

      localStorage.setItem('construction_projects', JSON.stringify(validProjects));
      localStorage.setItem('construction_tasks', JSON.stringify(validTasks));
      localStorage.setItem('construction_users', JSON.stringify(validUsers));
      localStorage.setItem('construction_comments', JSON.stringify(validComments));

      return { projects: validProjects, tasks: validTasks, users: validUsers, comments: validComments };
    }

    return { projects, tasks, users, comments };
  } catch (error) {
    console.error('Error ensuring storage consistency:', error);
    return { projects: [], tasks: [], users: [], comments: [] };
  }
};

// Performance monitoring for sync operations
export const syncPerformanceMonitor = {
  startTime: 0,
  
  start() {
    this.startTime = performance.now();
  },
  
  end(operation: string) {
    const duration = performance.now() - this.startTime;
    if (duration > 100) { // Log operations taking longer than 100ms
      console.warn(`Slow sync operation: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }
};
