import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

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
  status: "planning" | "in-progress" | "completed" | "on-hold";
  description?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  assignedTo: number;
  assignedBy: number;
  status: "not-started" | "in-progress" | "completed" | "on-hold";
  progress: number;
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdDate: string;
  building?: string;
  floor?: string;
  unit?: string;
  unitType?: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
  dependencies?: number[];
  files?: string[];
  comments?: Comment[];
  photos?: string[];
  canStartWithoutDependency?: boolean;
  dependentTasks?: number[];
  estimatedHours?: number;
  actualHours?: number;
  units_data?: Record<string, any>;
}

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "incharge" | "executive";
  phone?: string;
  status: "active" | "inactive";
  projects?: string[];
  joinDate: string;
  avatar?: string;
  confirmPassword?: string; // ✅ NEW
}

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
  blocks: any[];
  overallCompletion: number;
}

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  users: User[];
  getProjectHierarchy: (projectId: number) => ProjectHierarchy;
  getTaskDependencies: (taskId: number) => {
    dependencies: Task[];
    dependents: Task[];
  };
  canStartTask: (taskId: number) => boolean;
  getTaskComments: (taskId: number) => Comment[];
  addTaskComment: (taskId: number, comment: Omit<Comment, "id">) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  addProject: (project: Omit<Project, "id">) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  addUser: (user: Omit<User, "id">) => void;
  deleteUser: (id: number) => void;
  getUserById: (id: number) => User | undefined;
  getActiveUsers: () => User[];
  getUsersByRole: (role: string) => User[];
  handleAddDependency: (taskId: number, dependencyId: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const authHeader = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Map backend -> frontend shape
  const mapProject = (p: any): Project => ({
    id: p.id,
    name: p.name,
    location: p.location,
    client: p.client,
    startDate: p.start_date,
    endDate: p.end_date,
    buildings: p.buildings,
    floors: p.floors,
    units: p.units,
    managerId: p.manager,
    progress: p.progress,
    status: p.status,
    description: p.description || "",
  });

  const mapTask = (t: any): Task => ({
    id: t.id,
    title: t.title,
    description: t.description || "",
    projectId: t.project,
    assignedTo: t.assigned_to,
    assignedBy: t.assigned_by,
    status: t.status,
    progress: t.progress,
    priority: t.priority,
    dueDate: t.due_date,
    createdDate: t.created_date,
    building: t.building || undefined,
    floor: t.floor || undefined,
    unit: t.unit || undefined,
    unitType: (t.unit_type as any) || undefined,
    dependencies: t.dependencies || [],
    units_data: t.units_data || []
  });

  const mapUser = (u: any): User => ({
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username,
    email: u.email,
    username: u.username,
    role: u.role,
    phone: u.phone || "",
    status: u.status || "active",
    projects: u.projects
      ? u.projects.map((p: any) => ({
        id: p.id,
        name: p.name,
      }))
      : [],
    joinDate: u.join_date,
    confirmPassword: u.confirm_password || "", // ✅ add
  });

  const fetchAll = useCallback(async () => {
    if (!token) return;
    const [pRes, tRes, uRes] = await Promise.all([
      fetch(`${API_BASE}/api/projects/`, { headers: authHeader() }),
      fetch(`${API_BASE}/api/tasks/`, { headers: authHeader() }),
      fetch(`${API_BASE}/api/users/`, { headers: authHeader() }),
    ]);
    const [pJson, tJson, uJson] = await Promise.all([
      pRes.json(),
      tRes.json(),
      uRes.json(),
    ]);
    setProjects(pJson.map(mapProject));
    setTasks(tJson.map(mapTask));
    setUsers(uJson.map(mapUser));
  }, [token, authHeader]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ----- helpers -----
  const getProjectHierarchy = (projectId: number): ProjectHierarchy => ({
    projectId,
    blocks: [],
    overallCompletion: projects.find((p) => p.id === projectId)?.progress || 0,
  });

  const getTaskDependencies = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { dependencies: [], dependents: [] };
    const dependencies = (task.dependencies || [])
      .map((depId) => tasks.find((t) => t.id === depId))
      .filter(Boolean) as Task[];
    const dependents = tasks.filter((t) =>
      (t.dependencies || []).includes(taskId)
    );
    return { dependencies, dependents };
  };

  const handleAddDependency = (taskId: number, dependencyId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
            ...task,
            dependencies: [...(task.dependencies || []), dependencyId],
          }
          : task
      )
    );
  };

  const canStartTask = (_taskId: number) => true;
  const getTaskComments = (_taskId: number) => [];
  const addTaskComment = (_taskId: number, _comment: Omit<Comment, "id">) => { };

  // ----- CRUD that hit backend and update local state -----
  const addProject = async (project: Omit<Project, "id">) => {
    const payload = {
      name: project.name,
      location: project.location,
      client: project.client,
      start_date: project.startDate,
      end_date: project.endDate,
      buildings: project.buildings,
      floors: project.floors,
      units: project.units,
      manager: project.managerId,
      progress: project.progress,
      status: project.status,
      description: project.description,
    };
    const res = await fetch(`${API_BASE}/api/projects/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    setProjects((prev) => [...prev, mapProject(created)]);
  };

  const updateProject = async (id: number, updates: Partial<Project>) => {
    const res = await fetch(`${API_BASE}/api/projects/${id}/`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.location !== undefined
          ? { location: updates.location }
          : {}),
        ...(updates.client !== undefined ? { client: updates.client } : {}),
        ...(updates.startDate !== undefined
          ? { start_date: updates.startDate }
          : {}),
        ...(updates.endDate !== undefined ? { end_date: updates.endDate } : {}),
        ...(updates.buildings !== undefined
          ? { buildings: updates.buildings }
          : {}),
        ...(updates.floors !== undefined ? { floors: updates.floors } : {}),
        ...(updates.units !== undefined ? { units: updates.units } : {}),
        ...(updates.managerId !== undefined
          ? { manager: updates.managerId }
          : {}),
        ...(updates.progress !== undefined
          ? { progress: updates.progress }
          : {}),
        ...(updates.status !== undefined ? { status: updates.status } : {}),
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
      }),
    });
    const updated = await res.json();
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? mapProject(updated) : p))
    );
  };

  const addTask = async (task: Omit<Task, "id">) => {
    const payload = {
      title: task.title,
      description: task.description,
      project: task.projectId,
      assigned_to: task.assignedTo,
      assigned_by: task.assignedBy,
      status: task.status,
      progress: task.progress,
      priority: task.priority,
      due_date: task.dueDate,
      created_date: task.createdDate,
      building: task.building,
      floor: task.floor,
      unit: task.unit,
      unit_type: task.unitType,
      units_data: task.units_data || []  // ✅ include units_data
    };
    const res = await fetch(`${API_BASE}/api/tasks/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    setTasks((prev) => [...prev, mapTask(created)]);
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined)
      payload.description = updates.description;
    if (updates.projectId !== undefined) payload.project = updates.projectId;
    if (updates.assignedTo !== undefined)
      payload.assigned_to = updates.assignedTo;
    if (updates.assignedBy !== undefined)
      payload.assigned_by = updates.assignedBy;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.progress !== undefined) payload.progress = updates.progress;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.createdDate !== undefined)
      payload.created_date = updates.createdDate;
    if (updates.building !== undefined) payload.building = updates.building;
    if (updates.floor !== undefined) payload.floor = updates.floor;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.unitType !== undefined) payload.unit_type = updates.unitType;

    if (updates.units_data !== undefined) payload.units_data = updates.units_data; // ✅ include units_data

    const res = await fetch(`${API_BASE}/api/tasks/${id}/`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? mapTask(updated) : t)));
  };

  const addUser = async (user: Omit<User, "id">) => {
    const payload = {
      // username: user.email.split("@")[0],
      username: user.username || `${user.first_name}.${user.last_name}`.toLowerCase(),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password, // ✅ add password
      confirm_password: user.password,
      role: user.role,
      phone: user.phone,
      status: user.status,
      is_active: user.status === "active",
    };
    const res = await fetch(`${API_BASE}/api/users/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    setUsers((prev) => [...prev, mapUser(created)]);
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.first_name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.status !== undefined) {
      payload.status = updates.status;
      payload.is_active = updates.status === "active";
    }
    const res = await fetch(`${API_BASE}/api/users/${id}/`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === id ? mapUser(updated) : u)));
  };

  const deleteUser = async (id: number) => {
    await fetch(`${API_BASE}/api/users/${id}/`, {
      method: "DELETE",
      headers: authHeader(),
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const getUserById = (id: number) => users.find((u) => u.id === id);
  const getActiveUsers = () => users.filter((u) => u.status === "active");
  const getUsersByRole = (role: string) => users.filter((u) => u.role === role);

  const value: DataContextType = {
    projects,
    tasks,
    users,
    getProjectHierarchy,
    getTaskDependencies,
    canStartTask,
    getTaskComments,
    addTaskComment,
    updateProject,
    updateTask,
    addProject,
    addTask,
    updateUser,
    addUser,
    deleteUser,
    getUserById,
    getActiveUsers,
    getUsersByRole,
    handleAddDependency, // ✅ now included
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
};
