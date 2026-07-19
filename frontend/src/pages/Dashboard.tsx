import type { EmployeeSession } from "../types/employee";
import SuperAdminDashboard from "./dashboards/SuperAdminDashboard";
import HrDashboard from "./dashboards/HrDashboard";
import EmployeeDashboard from "./dashboards/EmployeeDashboard";

type DashboardProps = {
  employee: EmployeeSession | null;
  onLogout: () => void;
};

const Dashboard = ({ employee, onLogout }: DashboardProps) => {
  if (!employee) {
    return null;
  }

  if (employee.role === "super_admin") {
    return <SuperAdminDashboard employee={employee} onLogout={onLogout} />;
  }

  if (employee.role === "hr_manager") {
    return <HrDashboard employee={employee} onLogout={onLogout} />;
  }

  return <EmployeeDashboard employee={employee} onLogout={onLogout} />;
};

export default Dashboard;
