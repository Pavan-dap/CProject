import apiService from './api';
import type { User } from './authService';
import type { Project, ProjectHierarchy } from './projectService';

export interface Task {
  id: number;
  title: string;
  description: string;
  project: Project;
  hierarchy?: ProjectHierarchy;
  assigned_to: User;
  assigned_by: User;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  estimated_hours?: number;
  actual_hours: number;
  start_date?: string;
  due_date: string;
  completed_date?: string;
  can_start_without_dependency: boolean;
  created_at: string;
  updated_at: string;
  comments?: TaskComment[];
  files?: TaskFile[];
  photos?: TaskPhoto[];
  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
  can_start?: boolean;
  building?: string;
  floor?: string;
  unit?: string;
  unit_type?: '1BHK' | '2BHK' | '3BHK' | '4BHK' | '5BHK';
}

export interface TaskComment {
  id: number;
  text: string;
  comment_type: 'comment' | 'status_update' | 'dependency_update';
  user: User;
  user_name: string;
  created_at: string;
}

export interface TaskFile {
  id: number;
  file: string;
  file_name: string;
  file_type: string;
  uploaded_by: User;
  uploaded_at: string;
}

export interface TaskPhoto {
  id: number;
  photo: string;
  caption?: string;
  location_lat?: number;
  location_lng?: number;
  uploaded_by: User;
  uploaded_at: string;
}

export interface TaskDependency {
  id: number;
  depends_on: number;
  depends_on_title: string;
  created_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  project_id: number;
  hierarchy_id?: number;
  assigned_to_id: number;
  status: string;
  priority: string;
  progress: number;
  estimated_hours?: number;
  start_date?: string;
  due_date: string;
  can_start_without_dependency: boolean;
  dependencies?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  progress?: number;
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  can_start_without_dependency?: boolean;
  dependencies?: number[];
}

export interface TaskStats {
  total_tasks: number;
  by_status: {
    not_started: number;
    in_progress: number;
    completed: number;
    on_hold: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
  };
  overdue: number;
  due_today: number;
  average_progress: number;
}

export interface TaskDependencies {
  dependencies: Task[];
  dependents: Task[];
  can_start: boolean;
}

class TaskService {
  async getTasks(filters?: Record<string, string>): Promise<Task[]> {
    return apiService.get<Task[]>('/tasks/', { params: filters });
  }

  async getTaskById(id: number): Promise<Task> {
    return apiService.get<Task>(`/tasks/${id}/`);
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    return apiService.post<Task>('/tasks/', taskData);
  }

  async updateTask(id: number, taskData: UpdateTaskRequest): Promise<Task> {
    return apiService.patch<Task>(`/tasks/${id}/`, taskData);
  }

  async deleteTask(id: number): Promise<void> {
    return apiService.delete(`/tasks/${id}/`);
  }

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return apiService.get<TaskComment[]>(`/tasks/${taskId}/comments/`);
  }

  async addTaskComment(taskId: number, comment: { text: string; comment_type?: string }): Promise<TaskComment> {
    return apiService.post<TaskComment>(`/tasks/${taskId}/comments/add/`, comment);
  }

  async uploadTaskFile(taskId: number, file: File): Promise<TaskFile> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.upload<TaskFile>(`/tasks/${taskId}/files/upload/`, formData);
  }

  async uploadTaskPhoto(taskId: number, photo: File, caption?: string, location?: { lat: number; lng: number }): Promise<TaskPhoto> {
    const formData = new FormData();
    formData.append('photo', photo);
    if (caption) formData.append('caption', caption);
    if (location) {
      formData.append('location_lat', location.lat.toString());
      formData.append('location_lng', location.lng.toString());
    }
    return apiService.upload<TaskPhoto>(`/tasks/${taskId}/photos/upload/`, formData);
  }

  async getTaskDependencies(taskId: number): Promise<TaskDependencies> {
    return apiService.get<TaskDependencies>(`/tasks/${taskId}/dependencies/`);
  }

  async getTaskStats(): Promise<TaskStats> {
    return apiService.get<TaskStats>('/tasks/stats/');
  }

  async getMyTasks(): Promise<Task[]> {
    return apiService.get<Task[]>('/tasks/my-tasks/');
  }

  // Helper method to transform backend task to frontend format
  transformToFrontendTask(backendTask: any): any {
    return {
      id: backendTask.id,
      title: backendTask.title,
      description: backendTask.description,
      projectId: backendTask.project?.id,
      assignedTo: backendTask.assigned_to?.id,
      assignedBy: backendTask.assigned_by?.id,
      status: backendTask.status,
      progress: backendTask.progress,
      priority: backendTask.priority,
      dueDate: backendTask.due_date,
      createdDate: backendTask.created_at?.split('T')[0],
      building: backendTask.building,
      floor: backendTask.floor,
      unit: backendTask.unit,
      unitType: backendTask.unit_type,
      dependencies: backendTask.dependencies?.map((dep: any) => dep.depends_on) || [],
      dependentTasks: backendTask.dependents?.map((dep: any) => dep.task) || [],
      estimatedHours: backendTask.estimated_hours,
      actualHours: backendTask.actual_hours,
      canStartWithoutDependency: backendTask.can_start_without_dependency,
      files: backendTask.files?.map((file: any) => file.file_name) || [],
      photos: backendTask.photos?.map((photo: any) => photo.photo) || [],
      comments: backendTask.comments?.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        userId: comment.user.id,
        userName: comment.user_name,
        date: comment.created_at.split('T')[0],
        type: comment.comment_type,
      })) || [],
    };
  }

  // Helper method to transform frontend task to backend format
  transformToBackendTask(frontendTask: any): CreateTaskRequest {
    return {
      title: frontendTask.title,
      description: frontendTask.description,
      project_id: frontendTask.projectId,
      assigned_to_id: frontendTask.assignedTo,
      status: frontendTask.status,
      priority: frontendTask.priority,
      progress: frontendTask.progress,
      due_date: frontendTask.dueDate,
      estimated_hours: frontendTask.estimatedHours,
      can_start_without_dependency: frontendTask.canStartWithoutDependency || false,
      dependencies: frontendTask.dependencies || [],
    };
  }
}

export const taskService = new TaskService();
export default taskService;
