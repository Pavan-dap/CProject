import { useEffect, useCallback, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { User } from '../contexts/DataContext';

export const useRealTimeSync = () => {
  const [syncTrigger, setSyncTrigger] = useState(0);
  const { projects, tasks, users } = useData();

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
  }, [projects, tasks, users, forceSync]);

  return {
    syncTrigger,
    forceSync,
    isConnected: true // Always connected in this implementation
  };
};

export const useProjectSync = (projectId?: number) => {
  const { projects, tasks, users } = useData();
  const { syncTrigger } = useRealTimeSync();

  const project = projectId ? projects.find(p => p.id === projectId) : null;
  const projectTasks = projectId ? tasks.filter(t => t.projectId === projectId) : [];
  const projectUsers = projectId && project ? users.filter(u => u.projects.includes(project.name)) : [];

  return {
    project,
    projectTasks,
    projectUsers,
    syncTrigger,
    isLoaded: !!project || !projectId
  };
};

export const useTaskSync = (taskId?: number) => {
  const { tasks, projects, users, getUserById } = useData();
  const { syncTrigger } = useRealTimeSync();

  const task = taskId ? tasks.find(t => t.id === taskId) : null;
  const project = task ? projects.find(p => p.id === task.projectId) : null;
  const assignedUser = task ? getUserById(task.assignedTo) : null;
  const assignedByUser = task ? getUserById(task.assignedBy) : null;

  return {
    task,
    project,
    assignedUser,
    assignedByUser,
    syncTrigger,
    isLoaded: !!task || !taskId
  };
};

// Hook for real-time statistics that update everywhere
export const useRealTimeStats = () => {
  const { projects, tasks, users } = useData();
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
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    inactiveUsers: users.filter(u => u.status === 'inactive').length,
    usersByRole: {
      admin: users.filter(u => u.role === 'admin').length,
      manager: users.filter(u => u.role === 'manager').length,
      incharge: users.filter(u => u.role === 'incharge').length,
      executive: users.filter(u => u.role === 'executive').length
    },
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

// Hook for user-specific real-time sync
export const useUserSync = (userId?: number) => {
  const { users, tasks, projects, getUserById } = useData();
  const { syncTrigger } = useRealTimeSync();

  const user = userId ? getUserById(userId) : null;
  const userTasks = userId ? tasks.filter(t => t.assignedTo === userId || t.assignedBy === userId) : [];
  const userProjects = user ? projects.filter(p => user.projects.includes(p.name)) : [];

  return {
    user,
    userTasks,
    userProjects,
    assignedTasks: userId ? tasks.filter(t => t.assignedTo === userId) : [],
    createdTasks: userId ? tasks.filter(t => t.assignedBy === userId) : [],
    syncTrigger,
    isLoaded: !!user || !userId
  };
};

// Hook for real-time user management
export const useUserManagement = () => {
  const { users, getActiveUsers, getUsersByRole, updateUser, addUser, deleteUser } = useData();
  const { syncTrigger, forceSync } = useRealTimeSync();

  const activeUsers = getActiveUsers();
  const usersByRole = {
    admin: getUsersByRole('admin'),
    manager: getUsersByRole('manager'),
    incharge: getUsersByRole('incharge'),
    executive: getUsersByRole('executive')
  };

  const assignableUsers = users.filter(u => u.status === 'active' && (u.role === 'executive' || u.role === 'incharge'));

  return {
    users,
    activeUsers,
    usersByRole,
    assignableUsers,
    updateUser: (id: number, updates: any) => {
      updateUser(id, updates);
      forceSync();
    },
    addUser: (user: any) => {
      addUser(user);
      forceSync();
    },
    deleteUser: (id: number) => {
      deleteUser(id);
      forceSync();
    },
    syncTrigger
  };
};
