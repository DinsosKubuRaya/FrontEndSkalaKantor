import axios, { AxiosError } from "axios";
import {
  LoginResponse,
  UserProfile,
  Employee,
  EmployeeInput,
  EmployeeMeInput,
  ChangePasswordInput,
  DocumentStaff,
  DocumentAdminInput,
  DocumentSelfInput,
  ApiResponse,
  EmployeeBackendData
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor
api.interceptors.request.use((config) => {
  // Check if Authorization header already exists (e.g., passed directly)
  const existingAuth = config.headers.Authorization;
  
  if (existingAuth) {
    console.log("🔍 Axios Interceptor - Authorization header ALREADY SET (from direct pass) ✅");
    console.log("📤 Final header will be:", existingAuth);
    return config; // Skip interceptor, use the passed header
  }
  
  // Only add token from localStorage if no Authorization header exists
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("🔍 Axios Interceptor - Token from localStorage:", token ? "EXISTS ✅" : "NULL ❌");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 Final header set from localStorage");
    }
  }
  return config;
});

// Helper Error Message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message
    );
  }
  return String(error);
};

// --- AUTH API ---
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    const { data } = await api.post<LoginResponse>("/api/auth/login", formData);
    return data;
  },
  logout: async (refresh_token: string): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append("refresh_token", refresh_token); 
    const { data } = await api.post<ApiResponse<void>>("/api/auth/logout", formData);
    return data;
  },

  refreshToken: async (refresh_token: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append("refresh_token", refresh_token);

    const { data } = await api.post<LoginResponse>("/api/auth/refresh", formData);
    return data;
  },
};

// --- EMPLOYEE ---
export const employeeAPI = {
  create: async (payload: EmployeeInput): Promise<ApiResponse<Employee>> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("username", payload.username);
    if (payload.password) formData.append("password", payload.password);
    if (payload.role) formData.append("role", payload.role);
    const { data } = await api.post<ApiResponse<Employee>>("/api/employee/", formData);
    return data;
  },
  search: async (name: string): Promise<ApiResponse<Employee[]>> => {
    const { data } = await api.get<ApiResponse<Employee[]>>(`/api/employee/search?name=${name}`);
    return data;
  },
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    const { data } = await api.get<ApiResponse<Employee[]>>("/api/employee/");
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    const { data } = await api.get<ApiResponse<Employee>>(`/api/employee/${id}`);
    return data;
  },
  update: async (id: string, payload: Partial<EmployeeInput>): Promise<ApiResponse<Employee>> => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.username) formData.append("username", payload.username);
    if (payload.role) formData.append("role", payload.role);
    const { data } = await api.patch<ApiResponse<Employee>>(`/api/employee/${id}`, formData);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/api/employee/${id}`);
    return data;
  },
  getMe: async (token?: string): Promise<ApiResponse<EmployeeBackendData>> => {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    console.log("🎯 employeeAPI.getMe called with token:", token ? "PASSED DIRECTLY ✅" : "from interceptor");
    const { data } = await api.get<ApiResponse<EmployeeBackendData>>("/api/employee/me", config);
    return data;
  },
  updateMe: async (payload: EmployeeMeInput): Promise<ApiResponse<Employee>> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("username", payload.username);
    const { data } = await api.patch<ApiResponse<Employee>>("/api/employee/me", formData);
    return data;
  },
  changePassword: async (payload: ChangePasswordInput): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append("current_password", payload.current_password);
    formData.append("new_password", payload.new_password);
    formData.append("confirm_password", payload.confirm_password);

    const { data } = await api.patch<ApiResponse<void>>("/api/employee/me/change-password", formData);
    return data;
  },
};

// --- DOCUMENT STAFF ---
export const documentAPI = {
  createAdmin: async (payload: DocumentAdminInput): Promise<ApiResponse<DocumentStaff>> => {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    if (payload.user_id) formData.append("user_id", payload.user_id);
    if (payload.employee_id) formData.append("employee_id", payload.employee_id);
    if (payload.file) formData.append("file", payload.file);
    const { data } = await api.post<ApiResponse<DocumentStaff>>("/api/document_staff/", formData);
    return data;
  },
  uploadSelf: async (payload: DocumentSelfInput): Promise<ApiResponse<DocumentStaff>> => {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    if (payload.file) formData.append("file", payload.file);
    const { data } = await api.post<ApiResponse<DocumentStaff>>("/api/document_staff/upload", formData);
    return data;
  },
  getAllAdmin: async (): Promise<ApiResponse<DocumentStaff[]>> => {
    const { data } = await api.get<ApiResponse<DocumentStaff[]>>("/api/document_staff/");
    return data;
  },
  getMyDocuments: async (): Promise<ApiResponse<DocumentStaff[]>> => {
    const { data } = await api.get<ApiResponse<DocumentStaff[]>>("/api/document_staff/my-documents");
    return data;
  },
  updateAdmin: async (id: string, payload: DocumentAdminInput): Promise<ApiResponse<DocumentStaff>> => {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    if (payload.user_id) formData.append("user_id", payload.user_id);
    if (payload.employee_id) formData.append("employee_id", payload.employee_id);
    if (payload.file) formData.append("file", payload.file);
    const { data } = await api.patch<ApiResponse<DocumentStaff>>(`/api/document_staff/${id}`, formData);
    return data;
  },
  updateSelf: async (id: string, payload: DocumentSelfInput): Promise<ApiResponse<DocumentStaff>> => {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    if (payload.file) formData.append("file", payload.file);
    const { data } = await api.patch<ApiResponse<DocumentStaff>>(`/api/document_staff/my-documents/${id}`, formData);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/api/document_staff/${id}`);
    return data;
  },
};