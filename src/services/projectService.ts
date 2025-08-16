import apiService from './api';
import type { User } from './authService';

export interface Project {
  id: number;
  name: string;
  description?: string;
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  buildings: number;
  floors: number;
  units: number;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  budget?: number;
  manager: User;
  created_by: User;
  created_at: string;
  updated_at: string;
  task_count?: number;
  completed_task_count?: number;
  assignments?: ProjectAssignment[];
  hierarchy?: ProjectHierarchy[];
}

export interface ProjectAssignment {
  id: number;
  user: User;
  assigned_by: number;
  assigned_at: string;
  is_active: boolean;
}

export interface ProjectHierarchy {
  id: number;
  block_name: string;
  floor_number: number;
  unit_number: string;
  unit_type: '1BHK' | '2BHK' | '3BHK' | '4BHK' | '5BHK';
  completion_percentage: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  buildings: number;
  floors: number;
  units: number;
  status: string;
  progress: number;
  budget?: number;
  manager_id: number;
}

export interface ProjectStats {
  total_projects: number;
  by_status: {
    planning: number;
    in_progress: number;
    completed: number;
    on_hold: number;
  };
  average_progress: number;
  total_units: number;
}

export interface ProjectHierarchyResponse {
  project_id: number;
  blocks: Record<string, Record<number, ProjectHierarchy[]>>;
  raw_data: ProjectHierarchy[];
}

class ProjectService {
  async getProjects(status?: string): Promise<Project[]> {
    const params = status ? { status } : undefined;
    return apiService.get<Project[]>('/projects/', { params });
  }

  async getProjectById(id: number): Promise<Project> {
    return apiService.get<Project>(`/projects/${id}/`);
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    return apiService.post<Project>('/projects/', projectData);
  }

  async updateProject(id: number, projectData: Partial<CreateProjectRequest>): Promise<Project> {
    return apiService.patch<Project>(`/projects/${id}/`, projectData);
  }

  async deleteProject(id: number): Promise<void> {
    return apiService.delete(`/projects/${id}/`);
  }

  async assignUserToProject(projectId: number, userId: number): Promise<ProjectAssignment> {
    return apiService.post<ProjectAssignment>(`/projects/${projectId}/assign/`, {
      user_id: userId
    });
  }

  async removeUserFromProject(projectId: number, userId: number): Promise<void> {
    return apiService.delete(`/projects/${projectId}/remove/${userId}/`);
  }

  async getProjectHierarchy(projectId: number): Promise<ProjectHierarchyResponse> {
    return apiService.get<ProjectHierarchyResponse>(`/projects/${projectId}/hierarchy/`);
  }

  async getProjectStats(): Promise<ProjectStats> {
    return apiService.get<ProjectStats>('/projects/stats/');
  }

  // Helper method to transform backend data to frontend format
  transformToFrontendProject(backendProject: any): any {
    return {
      id: backendProject.id,
      name: backendProject.name,
      location: backendProject.location,
      client: backendProject.client,
      startDate: backendProject.start_date,
      endDate: backendProject.end_date,
      buildings: backendProject.buildings,
      floors: backendProject.floors,
      units: backendProject.units,
      managerId: backendProject.manager?.id,
      progress: backendProject.progress,
      status: backendProject.status,
      description: backendProject.description,
    };
  }

  // Helper method to transform frontend data to backend format
  transformToBackendProject(frontendProject: any): CreateProjectRequest {
    return {
      name: frontendProject.name,
      description: frontendProject.description,
      client: frontendProject.client,
      location: frontendProject.location,
      start_date: frontendProject.startDate,
      end_date: frontendProject.endDate,
      buildings: frontendProject.buildings,
      floors: frontendProject.floors,
      units: frontendProject.units,
      status: frontendProject.status,
      progress: frontendProject.progress,
      budget: frontendProject.budget,
      manager_id: frontendProject.managerId,
    };
  }
}

export const projectService = new ProjectService();
export default projectService;
