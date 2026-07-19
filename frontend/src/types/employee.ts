export type EmployeeRole = "super_admin" | "hr_manager" | "employee";

export type EmployeeSession = {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  role: EmployeeRole;
  department?: string;
  designation?: string;
  phoneNumber?: string;
  salary?: number;
  joiningDate?: string;
  reportingManager?: string;
  profilePicture?: string;
  status?: "active" | "inactive";
};
