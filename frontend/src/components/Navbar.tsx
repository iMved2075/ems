import { Notifications } from "@mui/icons-material";
import ThemeToggle from "../hooks/ThemeToggle";
import { Avatar } from "@mui/material";
import type { EmployeeSession } from "../types/employee";

type NavbarProps = {
  employee: EmployeeSession | null;
  onLogout: () => void;
};

const formatRole = (role?: string) => {
  if (role === "super_admin") {
    return "Super Admin";
  }

  if (role === "hr_manager") {
    return "HR";
  }

  return "Employee";
};

const Navbar = ({ employee, onLogout }: NavbarProps) => {
  return (
    <>
      <div className="flex justify-between items-center bg-(--background-color) border-b">
        <input
          type="text"
          placeholder="Search employees, files or reports..."
          className="ml-8 w-1/3 border border-slate-400/80 rounded-xl bg-(--search-bar-background) text-(--search-bar-text-color) px-4 py-1"
        />
        <div className="flex gap-10 px-5">
          <div>
            <Notifications className="m-5" />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 mr-5 pl-2 border-l">
            <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
            <div className="flex flex-col">
              <span className="text-(--text-color) text-xs font-medium">
                {employee?.employeeName ?? "John Doe"}
              </span>
              <span className="text-(--text-color) text-[11px] opacity-70">
                {formatRole(employee?.role)}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
