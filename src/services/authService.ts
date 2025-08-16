import apiService from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'incharge' | 'executive';
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    department?: string;
    employee_id?: string;
    join_date?: string;
    reporting_manager?: number;
  };
}

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  users_by_role: Record<string, number>;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login/', credentials);
    apiService.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout/');
    } finally {
      apiService.setToken(null);
    }
  }

  async getProfile(): Promise<User> {
    return apiService.get<User>('/auth/profile/');
  }

  async getUsers(): Promise<User[]> {
    return apiService.get<User[]>('/auth/users/');
  }

  async getUserById(id: number): Promise<User> {
    return apiService.get<User>(`/auth/users/${id}/`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiService.post<User>('/auth/users/', userData);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return apiService.patch<User>(`/auth/users/${id}/`, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return apiService.delete(`/auth/users/${id}/`);
  }

  async getUsersByRole(role?: string): Promise<User[]> {
    const params = role ? { role } : undefined;
    return apiService.get<User[]>('/auth/users/by-role/', { params });
  }

  async getUserStats(): Promise<UserStats> {
    return apiService.get<UserStats>('/auth/users/stats/');
  }

  isAuthenticated(): boolean {
    return !!apiService.getToken();
  }

  getCurrentToken(): string | null {
    return apiService.getToken();
  }
}

export const authService = new AuthService();
export default authService;
