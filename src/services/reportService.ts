import apiService from './api';
import type { User } from './authService';
import type { Project } from './projectService';

export interface Report {
  id: number;
  title: string;
  report_type: 'project_status' | 'task_progress' | 'user_performance' | 'project_summary' | 'gantt_chart';
  project?: Project;
  data: any;
  generated_by: User;
  generated_at: string;
  is_scheduled: boolean;
  schedule_frequency?: string;
}

export interface CreateReportRequest {
  title: string;
  report_type: string;
  project_id?: number;
  data: any;
}

export interface DashboardStats {
  projects: {
    total: number;
    by_status: {
      planning: number;
      in_progress: number;
      completed: number;
      on_hold: number;
    };
    average_progress: number;
  };
  tasks: {
    total: number;
    by_status: {
      not_started: number;
      in_progress: number;
      completed: number;
      on_hold: number;
    };
    overdue: number;
    due_today: number;
  };
  users?: {
    total: number;
    active: number;
    by_role: Record<string, number>;
  };
}

export interface ProjectStatusReportData {
  project_info: {
    name: string;
    client: string;
    location: string;
    status: string;
    progress: number;
    start_date: string;
    end_date: string;
    buildings: number;
    floors: number;
    units: number;
  };
  task_summary: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    not_started_tasks: number;
    on_hold_tasks: number;
    overdue_tasks: number;
  };
  progress_by_priority: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
  team_performance: Array<{
    user_name: string;
    role: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    average_progress: number;
  }>;
  generated_at: string;
}

export interface GanttData {
  project_name: string;
  gantt_data: Array<{
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    progress: number;
    status: string;
    priority: string;
    assigned_to: string;
    building: string;
    floor: string;
    unit: string;
    dependencies: number[];
  }>;
  generated_at: string;
}

class ReportService {
  async getReports(): Promise<Report[]> {
    return apiService.get<Report[]>('/reports/');
  }

  async getReportById(id: number): Promise<Report> {
    return apiService.get<Report>(`/reports/${id}/`);
  }

  async createReport(reportData: CreateReportRequest): Promise<Report> {
    return apiService.post<Report>('/reports/', reportData);
  }

  async deleteReport(id: number): Promise<void> {
    return apiService.delete(`/reports/${id}/`);
  }

  async generateProjectStatusReport(projectId: number): Promise<Report> {
    return apiService.post<Report>(`/reports/project/${projectId}/status/`);
  }

  async generateGanttData(projectId: number): Promise<GanttData> {
    return apiService.post<GanttData>(`/reports/project/${projectId}/gantt/`);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/reports/dashboard/stats/');
  }

  // Helper method to export report data as PDF/Excel would go here
  async exportReport(reportId: number, format: 'pdf' | 'excel'): Promise<Blob> {
    // This would typically call a backend endpoint that generates the file
    // For now, we'll return a placeholder
    return new Blob(['Report data'], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' });
  }

  // Helper method to format gantt data for the frontend chart component
  formatGanttDataForChart(ganttData: GanttData): any[] {
    return ganttData.gantt_data.map(task => ({
      id: task.id,
      name: task.name,
      start: new Date(task.start_date),
      end: new Date(task.end_date),
      progress: task.progress / 100,
      type: 'task',
      dependencies: task.dependencies.join(','),
      resource: task.assigned_to,
      project: ganttData.project_name,
      status: task.status,
      priority: task.priority,
      location: `${task.building} - ${task.floor} - ${task.unit}`,
    }));
  }

  // Helper method to format project status report for display
  formatProjectStatusReport(report: Report): ProjectStatusReportData {
    return report.data as ProjectStatusReportData;
  }
}

export const reportService = new ReportService();
export default reportService;
