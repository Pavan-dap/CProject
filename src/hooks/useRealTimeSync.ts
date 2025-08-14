import { useEffect, useCallback, useState } from 'react';
import { useData } from '../contexts/DataContext';

export const useRealTimeSync = () => {
  const [syncTrigger, setSyncTrigger] = useState(0);
  const { projects, tasks } = useData();

  // Force component re-render
  const forceSync = useCallback(() => {
    setSyncTrigger(prev => prev + 1);
  }, []);

  // Listen for data updates from any source
  useEffect(() => {
    const handleDataUpdate = () => {
      forceSync();
    };

    const handleStorageChange = () => {
      forceSync();
    };

    const handleGlobalStateUpdate = () => {
      forceSync();
    };

    // Listen to multiple update sources
    window.addEventListener('dataUpdate', handleDataUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('globalStateUpdate', handleGlobalStateUpdate);
    window.addEventListener('localStorageChange', handleStorageChange);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('globalStateUpdate', handleGlobalStateUpdate);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, [forceSync]);

  // Auto-sync when data dependencies change
  useEffect(() => {
    forceSync();
  }, [projects, tasks, forceSync]);

  return {
    syncTrigger,
    forceSync,
    isConnected: true // Always connected in this implementation
  };
};

export const useProjectSync = (projectId?: number) => {
  const { projects, tasks } = useData();
  const { syncTrigger } = useRealTimeSync();

  const project = projectId ? projects.find(p => p.id === projectId) : null;
  const projectTasks = projectId ? tasks.filter(t => t.projectId === projectId) : [];

  return {
    project,
    projectTasks,
    syncTrigger,
    isLoaded: !!project || !projectId
  };
};

export const useTaskSync = (taskId?: number) => {
  const { tasks, projects } = useData();
  const { syncTrigger } = useRealTimeSync();

  const task = taskId ? tasks.find(t => t.id === taskId) : null;
  const project = task ? projects.find(p => p.id === task.projectId) : null;

  return {
    task,
    project,
    syncTrigger,
    isLoaded: !!task || !taskId
  };
};

// Hook for real-time statistics that update everywhere
export const useRealTimeStats = () => {
  const { projects, tasks } = useData();
  const { syncTrigger } = useRealTimeSync();

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in-progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    overdueTasks: tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length,
    syncTrigger
  };

  return stats;
};

// Hook for component-level data refresh
export const useComponentRefresh = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Auto-refresh when global data changes
  useEffect(() => {
    const handleGlobalUpdate = () => {
      refresh();
    };

    window.addEventListener('dataUpdate', handleGlobalUpdate);
    window.addEventListener('globalStateUpdate', handleGlobalUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleGlobalUpdate);
      window.removeEventListener('globalStateUpdate', handleGlobalUpdate);
    };
  }, [refresh]);

  return { refreshKey, refresh };
};
