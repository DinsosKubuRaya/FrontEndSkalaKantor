export interface Employee {
  id: string;
  name: string;
  username: string;
  role: 'staff' | 'admin'; 
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface DocumentStaff {
  id: string;
  user_id?: string;
  employee_id?: string;
  file_url: string;
  subject: string;
  file_name: string;
  public_id: string;
  resource_type: string;
  employee?: Employee;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    last_page: number;
  };
}