import ManagementDashboard from "./ManagementDashboard";
import type { EmployeeSession } from "../../types/employee";

type Props = {
  employee: EmployeeSession;
  onLogout: () => void;
};

const SuperAdminDashboard = ({ employee, onLogout }: Props) => {
  return (
    <ManagementDashboard
      employee={employee}
      onLogout={onLogout}
      title="Super Admin Dashboard"
      subtitle="Full control over employee lifecycle, filters, and organization structure."
      allowDelete
      allowSuperAdminRole
    />
  );
};

export default SuperAdminDashboard;
