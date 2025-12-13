export type Role = "superadmin" | "admin" | "staff";
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: boolean;
}
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface EmployeeBackendData {
  id: string;       
  name: string;     
  username: string; 
  role: Role;      
  created_at?: string;
  updated_at?: string;
}
export interface UserProfile {
  ID: string;
  Name: string;
  Username: string;
  Role: Role; 
}
export interface Employee {
  ID: string;
  Name: string;
  Username: string;
  Role: Role;     
  CreatedAt?: string;
  UpdatedAt?: string;
}
export interface EmployeeInput {
  name: string;
  username: string;
  password?: string;
  role?: Role;
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
export interface DocumentStaff {
  ID: string;
  Subject: string;
  FileUrl: string;
  UserID: string;
  EmployeeID?: string;
  CreatedAt: string;
  UpdatedAt: string;
  User?: UserProfile;
  Employee?: Employee;
}

export interface DocumentAdminInput {
  user_id?: string;
  employee_id?: string;
  subject: string;
  file?: File | null;
}

export interface DocumentSelfInput {
  subject: string;
  file?: File | null;
}