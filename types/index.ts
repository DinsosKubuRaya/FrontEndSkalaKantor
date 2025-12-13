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

export interface DocumentStaff {
  ID: string;
  Subject: string;
  UserID: string;
  EmployeeID?: string;
  FilePath: string;
  FileUrl: string;
  CreatedAt: string;
  UpdatedAt: string;
  user?: {
    name: string;
    username: string;
  };
}

export interface DocumentAdminInput {
  subject: string;
  user_id?: string;
  employee_id?: string;
  file: File | null;
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