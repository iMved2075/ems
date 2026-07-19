import type { EmployeeRole, EmployeeSession } from "../types/employee";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

type ApiResponse<T> = {
  message?: string;
  data?: T;
};

type FilterType = "role" | "department" | "designation" | "status";

const getAccessToken = () => localStorage.getItem("accessToken");

const createAuthHeaders = (isJson = true) => {
  const headers = new Headers();

  if (isJson) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(body?.message || "Request failed.");
  }

  return body.data as T;
};

const requestJson = async <T>(path: string, init: RequestInit = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    ...init,
    headers: createAuthHeaders(true),
  });

  return parseResponse<T>(response);
};

const requestFormData = async <T>(path: string, formData: FormData, init: RequestInit = {}) => {
  const headers = createAuthHeaders(false);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    ...init,
    body: formData,
    headers,
  });

  return parseResponse<T>(response);
};

export const getCurrentProfile = async () => {
  return requestJson<EmployeeSession>("/employees/get-employee-profile", {
    method: "GET",
  });
};

export const getAllEmployees = async () => {
  return requestJson<EmployeeSession[]>("/employees/get-all-employees", {
    method: "GET",
  });
};

export const getOrganizationChart = async () => {
  return requestJson<EmployeeSession[]>("/organization/tree", {
    method: "GET",
  });
};

export const getEmployeesByFilter = async (filterType: FilterType, value: string) => {
  return requestJson<EmployeeSession[]>(`/employees/get-employee-by-${filterType}/${encodeURIComponent(value)}`, {
    method: "GET",
  });
};

export const createEmployee = async (formData: FormData) => {
  return requestFormData<EmployeeSession>("/employees/create-employee", formData, {
    method: "POST",
  });
};

export const updateEmployee = async (employeeId: string, formData: FormData) => {
  return requestFormData<EmployeeSession>(`/employees/update-employee/${employeeId}`, formData, {
    method: "PUT",
  });
};

export const deleteEmployee = async (employeeId: string) => {
  return requestJson<EmployeeSession>(`/employees/delete-employee/${employeeId}`, {
    method: "PUT",
  });
};

export const selfUpdateEmployee = async (formData: FormData) => {
  return requestFormData<EmployeeSession>("/employees/self-update-employee", formData, {
    method: "PUT",
  });
};

export const logoutEmployee = async () => {
  await requestJson<null>("/auth/logout", {
    method: "POST",
  });
};

export type { FilterType, EmployeeRole, EmployeeSession };
