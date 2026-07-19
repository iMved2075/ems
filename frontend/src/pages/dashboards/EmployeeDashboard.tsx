import { type ChangeEvent, useEffect, useState } from "react";
import { CheckCircle, Edit, Person, Security } from "@mui/icons-material";
import type { EmployeeSession } from "../../types/employee";
import { getCurrentProfile, selfUpdateEmployee } from "../../services/employeeApi";

type Props = {
  employee: EmployeeSession;
  onLogout: () => void;
};

const EmployeeDashboard = ({ employee }: Props) => {
  const [profile, setProfile] = useState<EmployeeSession>(employee);
  const [phoneNumber, setPhoneNumber] = useState(employee.phoneNumber ?? "");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const current = await getCurrentProfile();

        if (!cancelled) {
          setProfile(current);
          setPhoneNumber(current.phoneNumber ?? "");
        }
      } catch {
        if (!cancelled) {
          setProfile(employee);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [employee]);

  const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append("phoneNumber", phoneNumber);

      if (password.trim()) {
        payload.append("password", password);
      }

      await selfUpdateEmployee(payload);
      const updatedProfile = await getCurrentProfile();
      setProfile(updatedProfile);
      setPassword("");
      setMessage("Profile updated successfully.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section id="overview" className="rounded-2xl bg-(--background-color) p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-(--text-color)">Employee Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-(--text-color)">Welcome, {profile.employeeName}</h1>
            <p className="mt-2 text-(--text-color)">Self-service access for your profile and contact updates.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[320px]">
            <div className="rounded-xl bg-(--card-background) p-4">
              <p className="text-(--text-color)">Role</p>
              <p className="mt-1 font-semibold text-(--text-color)">Employee</p>
            </div>
            <div className="rounded-xl bg-(--card-background) p-4">
              <p className="text-(--text-color)">Department</p>
              <p className="mt-1 font-semibold text-(--text-color)">{profile.department ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="self-update" className="rounded-2xl bg-(--background-color) p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Edit className="text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">Self Update</h2>
            <p className="text-sm text-(--text-color)">Update only your phone number or password using the secured self-update route.</p>
          </div>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-(--text-color)">Phone Number</span>
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="9876543210"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-(--text-color)">New Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Leave blank to keep current password"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            <Security fontSize="small" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          {message ? (
            <p className="md:col-span-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle fontSize="small" /> {message}
            </p>
          ) : null}
        </form>
      </section>

      <section id="my-profile" className="rounded-2xl bg-(--background-color) p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Person className="text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">My Profile</h2>
            <p className="text-sm text-(--text-color)">Read-only snapshot from the backend profile route.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Detail label="Employee ID" value={profile.employeeId} />
          <Detail label="Email" value={profile.employeeEmail} />
          <Detail label="Designation" value={profile.designation ?? "N/A"} />
          <Detail label="Department" value={profile.department ?? "N/A"} />
          <Detail label="Status" value={profile.status ?? "active"} />
          <Detail label="Phone" value={profile.phoneNumber ?? "N/A"} />
        </div>
      </section>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default EmployeeDashboard;
