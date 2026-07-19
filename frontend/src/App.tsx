import "./App.css";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import RegisterSuperAdmin from "./pages/RegisterSuperAdmin";
import type { EmployeeSession } from "./types/employee";
import { getCurrentProfile, logoutEmployee } from "./services/employeeApi";

function App() {
  const [session, setSession] = useState<{
    accessToken: string | null;
    employee: EmployeeSession | null;
    isHydrating: boolean;
  }>(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedEmployee = localStorage.getItem("employee");

    return {
      accessToken,
      employee: storedEmployee ? (JSON.parse(storedEmployee) as EmployeeSession) : null,
      isHydrating: Boolean(accessToken && !storedEmployee),
    };
  });
  const [showRegisterSuperUser, setShowRegisterSuperUser] = useState(false);

  useEffect(() => {
    if (!session.accessToken || session.employee || !session.isHydrating) {
      return;
    }

    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const profile = await getCurrentProfile();

        if (cancelled) {
          return;
        }

        localStorage.setItem("employee", JSON.stringify(profile));
        setSession({
          accessToken: session.accessToken,
          employee: profile,
          isHydrating: false,
        });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("employee");

        if (!cancelled) {
          setSession({ accessToken: null, employee: null, isHydrating: false });
        }
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken, session.employee, session.isHydrating]);

  const handleLoginSuccess = (token: string, employee: EmployeeSession) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("employee", JSON.stringify(employee));
    setSession({ accessToken: token, employee, isHydrating: false });
    setShowRegisterSuperUser(false);
  };

  const handleLogout = async () => {
    try {
      await logoutEmployee();
    } catch {
      // Clear local state even if the API request fails.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("employee");
      setSession({ accessToken: null, employee: null, isHydrating: false });
      setShowRegisterSuperUser(false);
    }
  };

  if (session.isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        Restoring your session...
      </div>
    );
  }

  if (!session.accessToken) {
    if (showRegisterSuperUser) {
      return (
        <RegisterSuperAdmin
          onRegistrationSuccess={() => setShowRegisterSuperUser(false)}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuperUserClick={() => setShowRegisterSuperUser(true)}
      />
    );
  }

  return (
    <>
      <div className="flex">
        <Sidebar role={session.employee?.role ?? "employee"} />
        <div className="flex-1">
          <Navbar employee={session.employee} onLogout={handleLogout} />
          <div className="p-5">
            <Dashboard employee={session.employee} onLogout={handleLogout} />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
