import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Project, Task, Comment, User } from './DataContext';

interface GlobalState {
  projects: Project[];
  tasks: Task[];
  users: User[];
  comments: Comment[];
  selectedProject: Project | null;
  selectedTask: Task | null;
  selectedUser: User | null;
  refreshTrigger: number;
  loading: boolean;
  lastUpdated: number;
}

type GlobalAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'UPDATE_PROJECT'; payload: { id: number; updates: Partial<Project> } }
  | { type: 'UPDATE_TASK'; payload: { id: number; updates: Partial<Task> } }
  | { type: 'UPDATE_USER'; payload: { id: number; updates: Partial<User> } }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: number }
  | { type: 'ADD_COMMENT'; payload: { taskId: number; comment: Comment } }
  | { type: 'SET_SELECTED_PROJECT'; payload: Project | null }
  | { type: 'SET_SELECTED_TASK'; payload: Task | null }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'FORCE_REFRESH' }
  | { type: 'SET_LOADING'; payload: boolean };

const globalStateReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  const newState = { ...state, lastUpdated: Date.now() };
  
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...newState, projects: action.payload };

    case 'SET_TASKS':
      return { ...newState, tasks: action.payload };

    case 'SET_USERS':
      return { ...newState, users: action.payload };

    case 'SET_COMMENTS':
      return { ...newState, comments: action.payload };
    
    case 'UPDATE_PROJECT':
      return {
        ...newState,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates }
            : project
        )
      };
    
    case 'UPDATE_TASK':
      return {
        ...newState,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        )
      };

    case 'UPDATE_USER':
      return {
        ...newState,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        )
      };
    
    case 'ADD_PROJECT':
      return {
        ...newState,
        projects: [...state.projects, action.payload]
      };
    
    case 'ADD_TASK':
      return {
        ...newState,
        tasks: [...state.tasks, action.payload]
      };

    case 'ADD_USER':
      return {
        ...newState,
        users: [...state.users, action.payload]
      };

    case 'DELETE_USER':
      return {
        ...newState,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    case 'ADD_COMMENT':
      return {
        ...newState,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, comments: [...(task.comments || []), action.payload.comment] }
            : task
        )
      };
    
    case 'SET_SELECTED_PROJECT':
      return { ...newState, selectedProject: action.payload };
    
    case 'SET_SELECTED_TASK':
      return { ...newState, selectedTask: action.payload };

    case 'SET_SELECTED_USER':
      return { ...newState, selectedUser: action.payload };
    
    case 'FORCE_REFRESH':
      return { ...newState, refreshTrigger: state.refreshTrigger + 1 };
    
    case 'SET_LOADING':
      return { ...newState, loading: action.payload };
    
    default:
      return state;
  }
};

interface GlobalStateContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  updateProject: (id: number, updates: Partial<Project>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: number) => void;
  addTaskComment: (taskId: number, comment: Omit<Comment, 'id'>) => void;
  selectProject: (project: Project | null) => void;
  selectTask: (task: Task | null) => void;
  selectUser: (user: User | null) => void;
  forceRefresh: () => void;
  syncToLocalStorage: () => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

const initialState: GlobalState = {
  projects: [],
  tasks: [],
  users: [],
  comments: [],
  selectedProject: null,
  selectedTask: null,
  selectedUser: null,
  refreshTrigger: 0,
  loading: false,
  lastUpdated: Date.now()
};

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const projects = JSON.parse(localStorage.getItem('construction_projects') || '[]');
        const tasks = JSON.parse(localStorage.getItem('construction_tasks') || '[]');
        const users = JSON.parse(localStorage.getItem('construction_users') || '[]');
        const comments = JSON.parse(localStorage.getItem('construction_comments') || '[]');

        dispatch({ type: 'SET_PROJECTS', payload: projects });
        dispatch({ type: 'SET_TASKS', payload: tasks });
        dispatch({ type: 'SET_USERS', payload: users });
        dispatch({ type: 'SET_COMMENTS', payload: comments });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Sync to localStorage whenever data changes
  const syncToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('construction_projects', JSON.stringify(state.projects));
      localStorage.setItem('construction_tasks', JSON.stringify(state.tasks));
      localStorage.setItem('construction_users', JSON.stringify(state.users));
      localStorage.setItem('construction_comments', JSON.stringify(state.comments));

      // Broadcast changes to other components
      window.dispatchEvent(new CustomEvent('globalStateUpdate', {
        detail: { projects: state.projects, tasks: state.tasks, users: state.users, comments: state.comments }
      }));
    } catch (error) {
      console.error('Error syncing to localStorage:', error);
    }
  }, [state.projects, state.tasks, state.users, state.comments]);

  // Auto-sync when data changes
  useEffect(() => {
    syncToLocalStorage();
  }, [syncToLocalStorage]);

  const updateProject = useCallback((id: number, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const updateUser = useCallback((id: number, updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: { id, updates } });
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now() };
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now() };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  }, []);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now() };
    dispatch({ type: 'ADD_USER', payload: newUser });
  }, []);

  const deleteUser = useCallback((id: number) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  }, []);

  const addTaskComment = useCallback((taskId: number, comment: Omit<Comment, 'id'>) => {
    const newComment = { ...comment, id: Date.now() };
    dispatch({ type: 'ADD_COMMENT', payload: { taskId, comment: newComment } });
  }, []);

  const selectProject = useCallback((project: Project | null) => {
    dispatch({ type: 'SET_SELECTED_PROJECT', payload: project });
  }, []);

  const selectTask = useCallback((task: Task | null) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
  }, []);

  const selectUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
  }, []);

  const forceRefresh = useCallback(() => {
    dispatch({ type: 'FORCE_REFRESH' });
  }, []);

  return (
    <GlobalStateContext.Provider value={{
      state,
      dispatch,
      updateProject,
      updateTask,
      updateUser,
      addProject,
      addTask,
      addUser,
      deleteUser,
      addTaskComment,
      selectProject,
      selectTask,
      selectUser,
      forceRefresh,
      syncToLocalStorage
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
