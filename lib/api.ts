import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { Employee, LoginResponse, DocumentStaff } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// --- INTERCEPTORS ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/login");
      
      if (!isAuthEndpoint) {
        // Hapus token yang invalid
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        // Biarkan AuthContext yang handle redirect, jangan hard redirect di sini
        // Ini mencegah double redirect dan race condition
      }
    }
    return Promise.reject(error);
  }
);

// --- API ---
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/api/auth/login", {
      username,
      password,
    });
    if (response.data.access_token) {
      Cookies.set("access_token", response.data.access_token, { expires: 1 }); 
      Cookies.set("refresh_token", response.data.refresh_token, { expires: 7 }); 
    }
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    }
  },
};

// --- EMPLOYEE ---
export const employeeAPI = {
  me: async (): Promise<Employee> => {
    const response = await api.get<any>("/api/employee/me");
    // Backend bisa return { profile: {...} } atau langsung {...}
    // Handle kedua format untuk compatibility
    return response.data.profile || response.data;
  },
  updateMe: async (data: { name?: string; username?: string }): Promise<Employee> => {
    const response = await api.patch<Employee>("/api/employee/me", data);
    return response.data;
  },
  changePassword: async (oldPass: string, newPass: string): Promise<void> => {
    await api.patch("/api/employee/me/change-password", {
      old_password: oldPass,
      new_password: newPass,
    });
  },
  create: async (data: Pick<Employee, 'name' | 'username' | 'role'> & { password: string }): Promise<Employee> => {
    const response = await api.post<Employee>("/api/employee/", data);
    return response.data;
  },
  search: async (name: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>("/api/employee/search", {
      params: { name },
    });
    return response.data;
  },
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>("/api/employee/");
    return response.data;
  },
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.patch<Employee>(`/api/employee/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/employee/${id}`);
  },
};

// --- DOCUMENT STAFF ---
export const documentStaffAPI = {

  upload: async (formData: FormData): Promise<DocumentStaff> => {
    const response = await api.post<DocumentStaff>("/api/document_staff/upload", formData);
    return response.data;
  },
  getMyDocuments: async (): Promise<DocumentStaff[]> => {
    const response = await api.get<DocumentStaff[]>("/api/document_staff/my-documents");
    return response.data;
  },
  updateMyDocument: async (id: string, formData: FormData): Promise<DocumentStaff> => {
    const response = await api.patch<DocumentStaff>(`/api/document_staff/my-documents/${id}`, formData);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/document_staff/${id}`);
  },

  // --- Fitur Admin ---
  createAdmin: async (formData: FormData): Promise<DocumentStaff> => {
    const response = await api.post<DocumentStaff>("/api/document_staff/", formData);
    return response.data;
  },
  getAllAdmin: async (): Promise<DocumentStaff[]> => {
    const response = await api.get<DocumentStaff[]>("/api/document_staff/");
    return response.data;
  },
  updateAdmin: async (id: string, formData: FormData): Promise<DocumentStaff> => {
    const response = await api.patch<DocumentStaff>(`/api/document_staff/${id}`, formData);
    return response.data;
  },
};

// --- HELPER ---
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as { error?: string; message?: string };
    return data.error || data.message || `Terjadi kesalahan (Status: ${error.response.status})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak diketahui";
}