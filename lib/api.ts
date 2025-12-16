import axios, { AxiosError } from "axios";
import {
  LoginResponse,
  Employee,
  EmployeeInput,
  EmployeeMeInput,
  ChangePasswordInput,
  DocumentStaff,
  DocumentAdminInput,
  DocumentSelfInput,
  ApiResponse,
  ProfileResponse,
  PaginatedDocuments,
  EmployeeFilterParams,
  DocumentFilterParams
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor 
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const failedEndpoints = new Map<string, number>();
const MAX_RETRY_PER_ENDPOINT = 2;

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const shouldRetryRequest = (url: string): boolean => {
  const retryCount = failedEndpoints.get(url) || 0;
  return retryCount < MAX_RETRY_PER_ENDPOINT;
};

const incrementRetryCount = (url: string) => {
  const retryCount = failedEndpoints.get(url) || 0;
  failedEndpoints.set(url, retryCount + 1);
};

const clearRetryCount = (url: string) => {
  failedEndpoints.delete(url);
};

api.interceptors.response.use(
  (response) => {
    if (response.config.url) {
      clearRetryCount(response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest.url || '';
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!shouldRetryRequest(requestUrl)) {
        console.warn(`[API] Max retry attempts reached for ${requestUrl}`);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }


      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      incrementRetryCount(requestUrl);

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          console.warn("[API] No refresh token available");
          isRefreshing = false;
          processQueue(new Error("No refresh token available"));
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        try {
          console.log("[API] Attempting token refresh...");
          const formData = new FormData();
          formData.append("refresh_token", refreshToken);
          const { data } = await api.post<LoginResponse>("/api/auth/refresh", formData);

          if (data.access_token && data.refresh_token) {
            console.log("[API] Token refresh successful");
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            processQueue();
            isRefreshing = false;
            
            clearRetryCount(requestUrl);
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("[API] Token refresh failed:", refreshError);
          processQueue(refreshError as Error);
          isRefreshing = false;
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper Error Message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse<null> | undefined;
    if (data?.message) {
      return data.message;
    }
    return error.message;
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
  logout: async (refresh_token: string): Promise<ApiResponse<null>> => {
    const formData = new FormData();
    formData.append("refresh_token", refresh_token); 
    const { data } = await api.post<ApiResponse<null>>("/api/auth/logout", formData);
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
  getAll: async (params?: EmployeeFilterParams): Promise<ApiResponse<Employee[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.name) queryParams.append('name', params.name);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    const queryString = queryParams.toString();
    const { data } = await api.get<ApiResponse<Employee[]>>(`/api/employee/${queryString ? `?${queryString}` : ''}`);
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
  getMe: async (token?: string): Promise<ProfileResponse> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await api.get<ProfileResponse>("/api/employee/me", config);
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
  getAllAdmin: async (params?: DocumentFilterParams): Promise<ApiResponse<PaginatedDocuments>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.employee_id) queryParams.append('employee_id', params.employee_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const queryString = queryParams.toString();
    const { data } = await api.get<ApiResponse<PaginatedDocuments>>(`/api/document_staff/${queryString ? `?${queryString}` : ''}`);
    return data;
  },
  getMyDocuments: async (params?: DocumentFilterParams): Promise<ApiResponse<PaginatedDocuments>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const queryString = queryParams.toString();
    const { data } = await api.get<ApiResponse<PaginatedDocuments>>(`/api/document_staff/my-documents${queryString ? `?${queryString}` : ''}`);
    return data;
  },
  updateAdmin: async (id: string, payload: DocumentAdminInput): Promise<ApiResponse<DocumentStaff>> => {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    
    if (payload.user_id && payload.user_id.trim() !== "") {
      formData.append("user_id", payload.user_id);
    }
    if (payload.employee_id && payload.employee_id.trim() !== "") {
      formData.append("employee_id", payload.employee_id);
    }
    if (payload.file) {
      formData.append("file", payload.file);
    }
    
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