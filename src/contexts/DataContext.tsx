import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Project {
  id: number;
  name: string;
  location: string;
  client: string;
  startDate: string;
  endDate: string;
  buildings: number;
  floors: number;
  units: number;
  managerId: number;
  progress: number;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  description?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  assignedTo: number;
  assignedBy: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdDate: string;
  building?: string;
  floor?: string;
  unit?: string;
  unitType?: '1BHK' | '2BHK' | '3BHK' | '4BHK' | '5BHK';
  dependencies?: number[];
  files?: string[];
  comments?: Comment[];
  photos?: string[];
  canStartWithoutDependency?: boolean;
  dependentTasks?: number[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface Comment {
  id: number;
  text: string;
  userId: number;
  userName: string;
  date: string;
  type: 'comment' | 'status_update' | 'dependency_update';
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

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  getProjectHierarchy: (projectId: number) => ProjectHierarchy;
  getTaskDependencies: (taskId: number) => { dependencies: Task[], dependents: Task[] };
  canStartTask: (taskId: number) => boolean;
  getTaskComments: (taskId: number) => Comment[];
  addTaskComment: (taskId: number, comment: Omit<Comment, 'id'>) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data
const initialProjects: Project[] = [
  {
    id: 1,
    name: 'ABC Township Phase-2',
    location: 'Mumbai, Maharashtra',
    client: 'ABC Developers Ltd.',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    buildings: 25,
    floors: 4,
    units: 1000,
    managerId: 2,
    progress: 45,
    status: 'in-progress',
    description: 'Supply and installation of UPVC windows and doors for 1000 residential units'
  },
  {
    id: 2,
    name: 'Green Valley Complex',
    location: 'Pune, Maharashtra',
    client: 'Green Valley Housing',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    buildings: 15,
    floors: 6,
    units: 540,
    managerId: 2,
    progress: 25,
    status: 'in-progress',
    description: 'Complete door and window installation project'
  }
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Foundation Work - Block A',
    description: 'Complete foundation work for Block A',
    projectId: 1,
    assignedTo: 4,
    assignedBy: 3,
    status: 'completed',
    progress: 100,
    priority: 'high',
    dueDate: '2024-01-30',
    createdDate: '2024-01-20',
    building: 'Block A',
    floor: 'Foundation',
    dependencies: [],
    dependentTasks: [2, 3],
    estimatedHours: 240,
    actualHours: 235,
    photos: ['foundation-1.jpg', 'foundation-2.jpg'],
    files: ['foundation-specs.pdf', 'soil-test.pdf'],
    canStartWithoutDependency: true
  },
  {
    id: 2,
    title: 'Structural Work - Block A, Floor 1-5',
    description: 'Complete structural work for floors 1-5 in Block A',
    projectId: 1,
    assignedTo: 4,
    assignedBy: 3,
    status: 'in-progress',
    progress: 75,
    priority: 'high',
    dueDate: '2024-03-15',
    createdDate: '2024-01-25',
    building: 'Block A',
    floor: 'Floor 1-5',
    dependencies: [1],
    dependentTasks: [4, 5],
    estimatedHours: 480,
    actualHours: 360,
    photos: ['structure-1.jpg', 'structure-2.jpg', 'structure-3.jpg'],
    canStartWithoutDependency: false
  },
  {
    id: 3,
    title: 'Plumbing Rough-in - Block A, Floor 1',
    description: 'Install plumbing rough-in for all units on Floor 1',
    projectId: 1,
    assignedTo: 4,
    assignedBy: 3,
    status: 'not-started',
    progress: 10,
    priority: 'medium',
    dueDate: '2024-02-20',
    createdDate: '2024-01-28',
    building: 'Block A',
    floor: 'Floor 1',
    unit: 'All Units',
    dependencies: [1],
    dependentTasks: [6],
    estimatedHours: 120,
    actualHours: 15,
    canStartWithoutDependency: true,
    comments: [
      {
        id: 1,
        text: 'Started rough-in work for 3BHK units first',
        userId: 4,
        userName: 'Lisa Davis',
        date: '2024-02-01',
        type: 'status_update'
      }
    ]
  },
  {
    id: 4,
    title: 'UPVC Window Installation - Block A, Floor 1, 3BHK Units',
    description: 'Install UPVC windows in all 3BHK units on Floor 1',
    projectId: 1,
    assignedTo: 4,
    assignedBy: 3,
    status: 'in-progress',
    progress: 40,
    priority: 'high',
    dueDate: '2024-02-25',
    createdDate: '2024-02-01',
    building: 'Block A',
    floor: 'Floor 1',
    unit: '101, 102, 103, 104',
    unitType: '3BHK',
    dependencies: [2],
    estimatedHours: 80,
    actualHours: 32,
    photos: ['window-install-1.jpg', 'window-install-2.jpg'],
    files: ['window-specs.pdf', 'installation-guide.pdf'],
    canStartWithoutDependency: false,
    comments: [
      {
        id: 2,
        text: 'Completed units 101 and 102. Moving to 103 tomorrow.',
        userId: 4,
        userName: 'Lisa Davis',
        date: '2024-02-10',
        type: 'status_update'
      },
      {
        id: 3,
        text: 'Need coordination with electrical team for unit 104',
        userId: 4,
        userName: 'Lisa Davis',
        date: '2024-02-11',
        type: 'comment'
      }
    ]
  },
  {
    id: 5,
    title: 'Door Installation - Block A, Floor 1, 2BHK Units',
    description: 'Install doors in all 2BHK units on Floor 1',
    projectId: 1,
    assignedTo: 4,
    assignedBy: 3,
    status: 'not-started',
    progress: 0,
    priority: 'medium',
    dueDate: '2024-03-05',
    createdDate: '2024-02-01',
    building: 'Block A',
    floor: 'Floor 1',
    unit: '105, 106, 107, 108, 109, 110',
    unitType: '2BHK',
    dependencies: [2],
    estimatedHours: 60,
    actualHours: 0,
    canStartWithoutDependency: false
  },
  {
    id: 6,
    title: 'Electrical Work - Block A, Floor 1',
    description: 'Complete electrical installation for all units on Floor 1',
    projectId: 1,
    assignedTo: 4,
    assignedBy: 3,
    status: 'not-started',
    progress: 0,
    priority: 'high',
    dueDate: '2024-03-10',
    createdDate: '2024-02-01',
    building: 'Block A',
    floor: 'Floor 1',
    unit: 'All Units',
    dependencies: [3],
    estimatedHours: 100,
    actualHours: 0,
    canStartWithoutDependency: true
  },
  {
    id: 7,
    title: 'Site Preparation - Green Valley Block 1',
    description: 'Prepare site for construction in Green Valley Block 1',
    projectId: 2,
    assignedTo: 4,
    assignedBy: 3,
    status: 'completed',
    progress: 100,
    priority: 'high',
    dueDate: '2024-03-10',
    createdDate: '2024-03-01',
    building: 'Block 1',
    floor: 'Ground Floor'
  },
  {
    id: 8,
    title: 'Foundation - Green Valley Block 1',
    description: 'Foundation work for Green Valley Block 1',
    projectId: 2,
    assignedTo: 4,
    assignedBy: 3,
    status: 'in-progress',
    progress: 60,
    priority: 'high',
    dueDate: '2024-03-25',
    createdDate: '2024-03-05',
    building: 'Block 1',
    floor: 'Foundation',
    dependencies: [7],
    estimatedHours: 200,
    actualHours: 120,
    photos: ['green-valley-foundation-1.jpg'],
    canStartWithoutDependency: false
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('construction_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('construction_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('construction_comments');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('construction_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('construction_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('construction_comments', JSON.stringify(comments));
  }, [comments]);

  const getProjectHierarchy = (projectId: number): ProjectHierarchy => {
    const project = projects.find(p => p.id === projectId);
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    
    if (!project) {
      return { projectId, blocks: [], overallCompletion: 0 };
    }

    // Group tasks by block and floor
    const blocksMap = new Map();
    
    projectTasks.forEach(task => {
      const blockName = task.building || 'General';
      const floorNumber = task.floor ? parseInt(task.floor.replace(/\D/g, '')) || 0 : 0;
      const unitNumber = task.unit || 'General';
      const unitType = task.unitType || 'General';
      
      if (!blocksMap.has(blockName)) {
        blocksMap.set(blockName, new Map());
      }
      
      const floorsMap = blocksMap.get(blockName);
      if (!floorsMap.has(floorNumber)) {
        floorsMap.set(floorNumber, new Map());
      }
      
      const unitsMap = floorsMap.get(floorNumber);
      const unitKey = `${unitNumber}-${unitType}`;
      
      if (!unitsMap.has(unitKey)) {
        unitsMap.set(unitKey, {
          unitNumber,
          unitType,
          tasks: [],
          completionPercentage: 0
        });
      }
      
      unitsMap.get(unitKey).tasks.push(task);
    });

    // Calculate completion percentages
    const blocks = Array.from(blocksMap.entries()).map(([blockName, floorsMap]) => {
      const floors = Array.from(floorsMap.entries()).map(([floorNumber, unitsMap]) => {
        const units = Array.from(unitsMap.values()).map(unit => {
          const totalProgress = unit.tasks.reduce((sum, task) => sum + task.progress, 0);
          const completionPercentage = unit.tasks.length > 0 ? totalProgress / unit.tasks.length : 0;
          return { ...unit, completionPercentage };
        });
        
        const floorCompletion = units.length > 0 
          ? units.reduce((sum, unit) => sum + unit.completionPercentage, 0) / units.length 
          : 0;
        
        return {
          floorNumber,
          units,
          completionPercentage: floorCompletion
        };
      });
      
      const blockCompletion = floors.length > 0 
        ? floors.reduce((sum, floor) => sum + floor.completionPercentage, 0) / floors.length 
        : 0;
      
      return {
        blockName,
        floors,
        completionPercentage: blockCompletion
      };
    });

    const overallCompletion = blocks.length > 0 
      ? blocks.reduce((sum, block) => sum + block.completionPercentage, 0) / blocks.length 
      : 0;

    return {
      projectId,
      blocks,
      overallCompletion
    };
  };

  const getTaskDependencies = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { dependencies: [], dependents: [] };
    
    const dependencies = tasks.filter(t => task.dependencies?.includes(t.id));
    const dependents = tasks.filter(t => t.dependencies?.includes(taskId));
    
    return { dependencies, dependents };
  };

  const canStartTask = (taskId: number): boolean => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    if (task.canStartWithoutDependency) return true;
    if (!task.dependencies || task.dependencies.length === 0) return true;
    
    const dependencyTasks = tasks.filter(t => task.dependencies?.includes(t.id));
    return dependencyTasks.every(t => t.status === 'completed');
  };

  const getTaskComments = (taskId: number): Comment[] => {
    const task = tasks.find(t => t.id === taskId);
    return task?.comments || [];
  };

  const addTaskComment = (taskId: number, comment: Omit<Comment, 'id'>) => {
    const newComment = { ...comment, id: Date.now() };
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, comments: [...(task.comments || []), newComment] }
          : task
      )
    );
  };

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now() };
    setProjects(prev => [...prev, newProject]);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now() };
    setTasks(prev => [...prev, newTask]);
  };

  return (
    <DataContext.Provider value={{
      projects,
      tasks,
      getProjectHierarchy,
      getTaskDependencies,
      canStartTask,
      getTaskComments,
      addTaskComment,
      updateProject,
      updateTask,
      addProject,
      addTask
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
