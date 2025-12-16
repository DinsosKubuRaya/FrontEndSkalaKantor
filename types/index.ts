export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  status?: boolean;
  meta?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ProfileResponse {
  message: string;
  profile: EmployeeBackendData;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}
export interface UserProfile {
  ID: string;
  Name: string;
  Username: string;
  Role: string;
}
export interface EmployeeBackendData {
  id: string;
  name: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}
export interface Employee {
  ID: string;
  Name: string;
  Username: string;
  Role: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}


export type EmployeeApiResponse = EmployeeBackendData | Employee;

export interface EmployeeInput {
  name: string;
  username: string;
  password?: string;
  role: string;
}

export interface EmployeeMeInput {
  name: string;
  username: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export type Role = "staff" | "admin" | "supervisor";


export interface EmployeeFilterParams {
  limit?: number;
  page?: number;
  name?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface DocumentFilterParams {
  limit?: number;
  page?: number;
  subject?: string;
  user_id?: string;
  employee_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface DocumentStaff {
  id: string;
  subject: string;
  user_id?: string;
  employee_id?: string;
  file_path?: string;
  file_url: string;
  file_name?: string;
  public_id?: string;
  resource_type?: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  user?: {
    name: string;
    username: string;
  };
}

export interface DocumentAdminInput {
  subject: string;
  user_id?: string;
  employee_id?: string;
  file?: File | null;
}

export interface DocumentSelfInput {
  subject: string;
  file: File | null;
}

export interface PaginatedDocuments {
  documents: DocumentStaff[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}