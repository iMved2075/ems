import ManagementDashboard from "./ManagementDashboard";
import type { EmployeeSession } from "../../types/employee";

type Props = {
  employee: EmployeeSession;
  onLogout: () => void;
};

const HrDashboard = ({ employee, onLogout }: Props) => {
  return (
    <ManagementDashboard
      employee={employee}
      onLogout={onLogout}
      title="HR Dashboard"
      subtitle="Manage employee records, filters, and organization visibility within HR access limits."
      allowDelete={false}
      allowSuperAdminRole={false}
    />
  );
};

export default HrDashboard;
