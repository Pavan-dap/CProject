import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import projectService, { type Project } from "../services/projectService";
import taskService, { type Task } from "../services/taskService";
import authService, { type User } from "../services/authService";
import reportService from "../services/reportService";

export interface Comment {
  id: number;
  text: string;
  userId: number;
  userName: string;
  date: string;
  type: "comment" | "status_update" | "dependency_update";
}

export interface ProjectHierarchy {
  projectId: number;
  blocks: {
    blockName: string;
    floors: {
      floorNumber: number;
      units: {
        unitNumber: string;
        unitType: string;
        tasks: Task[];
        completionPercentage: number;
      }[];
      completionPercentage: number;
    }[];
    completionPercentage: number;
  }[];
  overallCompletion: number;
}

interface ApiDataContextType {
  projects: Project[];
  tasks: Task[];
  users: User[];
  loading: boolean;
  error: string | null;
  
  // Project methods
  getProjectHierarchy: (projectId: number) => Promise<ProjectHierarchy>;
  updateProject: (id: number, updates: Partial<Project>) => Promise<void>;
  addProject: (project: any) => Promise<void>;
  
  // Task methods
  getTaskDependencies: (taskId: number) => Promise<{
    dependencies: Task[];
    dependents: Task[];
    canStart: boolean;
  }>;
  canStartTask: (taskId: number) => boolean;
  getTaskComments: (taskId: number) => Promise<Comment[]>;
  addTaskComment: (taskId: number, comment: Omit<Comment, "id">) => Promise<void>;
  updateTask: (id: number, updates: any) => Promise<void>;
  addTask: (task: any) => Promise<void>;
  
  // User methods
  updateUser: (id: number, updates: Partial<User>) => Promise<void>;
  addUser: (user: any) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  getUserById: (id: number) => User | undefined;
  getActiveUsers: () => User[];
  getUsersByRole: (role: string) => User[];
  
  // Data refresh
  refreshData: () => Promise<void>;
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

export const ApiDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
        authService.getUsers(),
      ]);
      
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Project methods
  const getProjectHierarchy = useCallback(async (projectId: number): Promise<ProjectHierarchy> => {
    try {
      const hierarchyData = await projectService.getProjectHierarchy(projectId);
      
      // Transform API response to frontend format
      const blocks = Object.entries(hierarchyData.blocks).map(([blockName, floors]) => ({
        blockName,
        floors: Object.entries(floors).map(([floorNum, units]) => ({
          floorNumber: parseInt(floorNum),
          units: units.map((unit: any) => ({
            unitNumber: unit.unit_number,
            unitType: unit.unit_type,
            tasks: tasks.filter(t => 
              t.building === blockName && 
              t.floor === `Floor ${floorNum}` && 
              t.unit === unit.unit_number
            ),
            completionPercentage: unit.completion_percentage,
          })),
          completionPercentage: units.reduce((sum: number, unit: any) => sum + unit.completion_percentage, 0) / units.length,
        })),
        completionPercentage: 0, // Will be calculated
      }));

      // Calculate block completion percentages
      blocks.forEach(block => {
        if (block.floors.length > 0) {
          block.completionPercentage = block.floors.reduce((sum, floor) => sum + floor.completionPercentage, 0) / block.floors.length;
        }
      });

      const overallCompletion = blocks.length > 0 
        ? blocks.reduce((sum, block) => sum + block.completionPercentage, 0) / blocks.length 
        : 0;

      return {
        projectId,
        blocks,
        overallCompletion,
      };
    } catch (err) {
      console.error('Failed to get project hierarchy:', err);
      throw err;
    }
  }, [tasks]);

  const updateProject = useCallback(async (id: number, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  }, []);

  const addProject = useCallback(async (project: any) => {
    try {
      const backendProject = projectService.transformToBackendProject(project);
      const newProject = await projectService.createProject(backendProject);
      setProjects(prev => [...prev, newProject]);
    } catch (err) {
      console.error('Failed to add project:', err);
      throw err;
    }
  }, []);

  // Task methods
  const getTaskDependencies = useCallback(async (taskId: number) => {
    try {
      return await taskService.getTaskDependencies(taskId);
    } catch (err) {
      console.error('Failed to get task dependencies:', err);
      throw err;
    }
  }, []);

  const canStartTask = useCallback((taskId: number): boolean => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    if (task.can_start_without_dependency) return true;
    
    // This would need to be enhanced with actual dependency checking
    return task.can_start ?? false;
  }, [tasks]);

  const getTaskComments = useCallback(async (taskId: number): Promise<Comment[]> => {
    try {
      const comments = await taskService.getTaskComments(taskId);
      return comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        userId: comment.user.id,
        userName: comment.user_name,
        date: comment.created_at.split('T')[0],
        type: comment.comment_type,
      }));
    } catch (err) {
      console.error('Failed to get task comments:', err);
      return [];
    }
  }, []);

  const addTaskComment = useCallback(async (taskId: number, comment: Omit<Comment, "id">) => {
    try {
      await taskService.addTaskComment(taskId, {
        text: comment.text,
        comment_type: comment.type,
      });
      // Refresh task data to get updated comments
      const updatedTask = await taskService.getTaskById(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      console.error('Failed to add task comment:', err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: number, updates: any) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, []);

  const addTask = useCallback(async (task: any) => {
    try {
      const backendTask = taskService.transformToBackendTask(task);
      const newTask = await taskService.createTask(backendTask);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error('Failed to add task:', err);
      throw err;
    }
  }, []);

  // User methods
  const updateUser = useCallback(async (id: number, updates: Partial<User>) => {
    try {
      const updatedUser = await authService.updateUser(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }, []);

  const addUser = useCallback(async (user: any) => {
    try {
      const newUser = await authService.createUser(user);
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await authService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  }, []);

  const getUserById = useCallback((id: number): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const getActiveUsers = useCallback((): User[] => {
    return users.filter(user => user.is_active);
  }, [users]);

  const getUsersByRole = useCallback((role: string): User[] => {
    return users.filter(user => user.role === role && user.is_active);
  }, [users]);

  return (
    <ApiDataContext.Provider
      value={{
        projects,
        tasks,
        users,
        loading,
        error,
        getProjectHierarchy,
        updateProject,
        addProject,
        getTaskDependencies,
        canStartTask,
        getTaskComments,
        addTaskComment,
        updateTask,
        addTask,
        updateUser,
        addUser,
        deleteUser,
        getUserById,
        getActiveUsers,
        getUsersByRole,
        refreshData,
      }}
    >
      {children}
    </ApiDataContext.Provider>
  );
};

export const useApiData = (): ApiDataContextType => {
  const context = useContext(ApiDataContext);
  if (context === undefined) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
};
