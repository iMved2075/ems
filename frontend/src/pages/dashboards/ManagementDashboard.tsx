import { useEffect, useMemo, useState } from "react";
import {
  AccountBox,
  AddCircleOutlined,
  Apartment,
  Delete,
  FilterAlt,
  Groups,
  MoreTime,
  Search,
  Security,
  Edit,
} from "@mui/icons-material";
import type { ChangeEvent, FormEvent } from "react";
import type { EmployeeSession } from "../../types/employee";
import type { FilterType } from "../../services/employeeApi";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getCurrentProfile,
  getEmployeesByFilter,
  getOrganizationChart,
  updateEmployee,
} from "../../services/employeeApi";

type Props = {
  employee: EmployeeSession;
  onLogout: () => void;
  title: string;
  subtitle: string;
  allowDelete: boolean;
  allowSuperAdminRole: boolean;
};

type CreateFormState = {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  password: string;
  phoneNumber: string;
  designation: string;
  department: string;
  salary: string;
  joiningDate: string;
  reportingManager: string;
  role: "super_admin" | "hr_manager" | "employee";
};

type UpdateFormState = {
  employeeMongoId: string;
  employeeName: string;
  employeeEmail: string;
  phoneNumber: string;
  designation: string;
  department: string;
  password: string;
  salary: string;
  joiningDate: string;
  status: "active" | "inactive";
  reportingManager: string;
  role: "super_admin" | "hr_manager" | "employee";
};

const initialCreateForm: CreateFormState = {
  employeeId: "",
  employeeName: "",
  employeeEmail: "",
  password: "",
  phoneNumber: "",
  designation: "",
  department: "",
  salary: "",
  joiningDate: "",
  reportingManager: "",
  role: "employee",
};

const initialUpdateForm: UpdateFormState = {
  employeeMongoId: "",
  employeeName: "",
  employeeEmail: "",
  phoneNumber: "",
  designation: "",
  password: "",
  department: "",
  salary: "",
  joiningDate: "",
  status: "active",
  reportingManager: "",
  role: "employee",
};

type OrgNode = EmployeeSession & {
  subordinates?: OrgNode[];
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

const formatCount = (value: number) => value.toLocaleString();

const ManagementDashboard = ({
  employee,
  title,
  subtitle,
  allowDelete,
  allowSuperAdminRole,
}: Props) => {
  const [employees, setEmployees] = useState<EmployeeSession[]>([]);
  const [profile, setProfile] = useState<EmployeeSession>(employee);
  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeSession[] | null
  >(null);
  const [organizationTree, setOrganizationTree] = useState<OrgNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionData, setActionData] = useState<unknown | null>(null);
  const [actionError, setActionError] = useState("");
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    ...initialCreateForm,
    role: allowSuperAdminRole ? "employee" : "employee",
  });
  const [updateForm, setUpdateForm] = useState<UpdateFormState>({
    ...initialUpdateForm,
    role: allowSuperAdminRole ? "employee" : "employee",
  });
  const [deleteEmployeeId, setDeleteEmployeeId] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("role");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [allEmployees, currentProfile] = await Promise.all([
          getAllEmployees(),
          getCurrentProfile(),
        ]);

        if (cancelled) {
          return;
        }

        setEmployees(allEmployees);
        setProfile(currentProfile);
      } catch (error) {
        if (!cancelled) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const statistics = useMemo(() => {
    const activeCount = employees.filter(
      (item) => item.status === "active"
    ).length;
    const inactiveCount = employees.filter(
      (item) => item.status === "inactive"
    ).length;
    const departments = new Set(
      employees.map((item) => item.department).filter(Boolean)
    );

    return [
      {
        label: "Total Employees",
        value: employees.length,
        icon: <AccountBox />,
      },
      { label: "Active Employees", value: activeCount, icon: <Groups /> },
      { label: "Inactive Employees", value: inactiveCount, icon: <MoreTime /> },
      { label: "Departments", value: departments.size, icon: <Apartment /> },
    ];
  }, [employees]);

  const roleOptions = allowSuperAdminRole
    ? ["employee", "hr_manager", "super_admin"]
    : ["employee", "hr_manager"];

  const updateAllowedFields = allowSuperAdminRole
    ? [
        "employeeName",
        "employeeEmail",
        "phoneNumber",
        "designation",
        "department",
        "salary",
        "joiningDate",
        "status",
        "reportingManager",
        "role",
      ]
    : ["phoneNumber", "designation", "department", "salary"];

  const handleCreateChange =
    (field: keyof CreateFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setCreateForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handleUpdateChange =
    (field: keyof UpdateFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setUpdateForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const refreshEmployees = async () => {
    const [allEmployees, currentProfile] = await Promise.all([
      getAllEmployees(),
      getCurrentProfile(),
    ]);

    setEmployees(allEmployees);
    setProfile(currentProfile);
    setFilteredEmployees(null);
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage("");
    setActionData(null);
    setActionError("");
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("employeeId", createForm.employeeId.trim());
      payload.append("employeeName", createForm.employeeName.trim());
      payload.append("employeeEmail", createForm.employeeEmail.trim());
      payload.append("password", createForm.password);
      payload.append("phoneNumber", createForm.phoneNumber.trim());
      payload.append("designation", createForm.designation.trim());
      payload.append("department", createForm.department.trim());
      payload.append("salary", createForm.salary.trim());
      payload.append("joiningDate", createForm.joiningDate);
      payload.append("role", createForm.role);

      if (createForm.reportingManager.trim()) {
        payload.append("reportingManager", createForm.reportingManager.trim());
      }

      if (createImage) {
        payload.append("profileImage", createImage);
      }

      await createEmployee(payload);
      await refreshEmployees();
      setCreateForm({
        ...initialCreateForm,
        role: allowSuperAdminRole ? "employee" : "employee",
      });
      setCreateImage(null);
      setActionMessage("Employee created successfully.");
      setActionData({
        employeeId: createForm.employeeId,
        employeeEmail: createForm.employeeEmail,
        temporaryPassword: createForm.password
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to create employee."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage("");
    setActionError("");
    setActionData(null);
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      const updateEntries: Array<[keyof UpdateFormState, string]> =
        allowSuperAdminRole
          ? [
              ["employeeName", updateForm.employeeName],
              ["employeeEmail", updateForm.employeeEmail],
              ["phoneNumber", updateForm.phoneNumber],
              ["designation", updateForm.designation],
              ["department", updateForm.department],
              ["salary", updateForm.salary],
              ["joiningDate", updateForm.joiningDate],
              ["status", updateForm.status],
              ["reportingManager", updateForm.reportingManager],
              ["role", updateForm.role],
              ["password", updateForm.password],
            ]
          : [
              ["phoneNumber", updateForm.phoneNumber],
              ["designation", updateForm.designation],
              ["department", updateForm.department],
              ["salary", updateForm.salary],
            ];

      updateEntries.forEach(([field, value]) => {
        if (value.trim()) {
          payload.append(field, value.trim());
        }
      });

      if (!updateForm.employeeMongoId.trim()) {
        throw new Error("Mongo record ID is required for updates.");
      }

      await updateEmployee(updateForm.employeeMongoId.trim(), payload);
      await refreshEmployees();
      setActionMessage("Employee updated successfully.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to update employee."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!allowDelete) {
      return;
    }

    setActionMessage("");
    setActionError("");
    setActionData(null);
    setIsSubmitting(true);

    try {
      await deleteEmployee(deleteEmployeeId.trim());
      await refreshEmployees();
      setDeleteEmployeeId("");
      setActionMessage("Employee deleted successfully.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete employee."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage("");
    setActionError("");
    setActionData(null);
    setIsSubmitting(true);

    try {
      const results = await getEmployeesByFilter(
        filterType,
        filterValue.trim()
      );
      setFilteredEmployees(results);
      setActionMessage(`Found ${results.length} matching employees.`);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Filter request failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadOrganizationTree = async () => {
    setActionMessage("");
    setActionError("");
    setActionData(null);
    setIsSubmitting(true);

    try {
      const tree = await getOrganizationChart();
      setOrganizationTree(tree as OrgNode[]);
      setActionMessage("Organization chart loaded successfully.");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to load organization chart."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-(--background-color) p-6 shadow-sm">
        Loading dashboard...
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <section
        id="overview"
        className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-(--text-color)">
              {title}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-(--text-color)">
              Welcome, {profile.employeeName}
            </h1>
            <p className="mt-2 text-(--text-color)">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[320px]">
            <div className="rounded-xl bg-(--background-color)p-4">
              <p className="text-(--text-color)">Role</p>
              <p className="mt-1 font-semibold text-(--text-color)">
                {formatRole(employee.role)}
              </p>
            </div>
            <div className="rounded-xl bg-(--background-color)p-4">
              <p className="text-(--text-color)">Accessible APIs</p>
              <p className="mt-1 font-semibold text-(--text-color)">
                CRUD + filters
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-300 bg-(--background-color) p-5"
            >
              <div className="flex items-center justify-between text-(--text-color)">
                <span>{stat.label}</span>
                {stat.icon}
              </div>
              <p className="mt-3 text-3xl font-semibold text-(--text-color)">
                {formatCount(stat.value as number)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="create-employee"
        className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <AddCircleOutlined className="text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">
              Create Employee
            </h2>
            <p className="text-sm text-(--text-color)">
              Uses the secured create employee route. Super admins can also
              choose the super admin role.
            </p>
          </div>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleCreateSubmit}
        >
          <InputField
            label="Employee ID"
            value={createForm.employeeId}
            onChange={handleCreateChange("employeeId")}
            placeholder="EMP-001"
          />
          <InputField
            label="Full Name"
            value={createForm.employeeName}
            onChange={handleCreateChange("employeeName")}
            placeholder="Alex Morgan"
          />
          <InputField
            label="Email"
            type="email"
            value={createForm.employeeEmail}
            onChange={handleCreateChange("employeeEmail")}
            placeholder="admin@company.com"
          />
          <InputField
            label="Phone Number"
            value={createForm.phoneNumber}
            onChange={handleCreateChange("phoneNumber")}
            placeholder="9876543210"
          />
          <InputField
            label="Designation"
            value={createForm.designation}
            onChange={handleCreateChange("designation")}
            placeholder="Chief Administrator"
          />
          <InputField
            label="Department"
            value={createForm.department}
            onChange={handleCreateChange("department")}
            placeholder="Operations"
          />
          <InputField
            label="Salary"
            type="number"
            value={createForm.salary}
            onChange={handleCreateChange("salary")}
            placeholder="120000"
          />
          <InputField
            label="Joining Date"
            type="date"
            value={createForm.joiningDate}
            onChange={handleCreateChange("joiningDate")}
          />
          <InputField
            label="Reporting Manager"
            value={createForm.reportingManager}
            onChange={handleCreateChange("reportingManager")}
            placeholder="Mongo user id or employee id"
          />
          <SelectField
            label="Role"
            value={createForm.role}
            onChange={handleCreateChange("role")}
            options={roleOptions}
          />
          <InputField
            label="Password"
            type="password"
            onChange={handleCreateChange("password")}
            placeholder="Enter a secure password"
            value={createForm.password}
          />

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-(--text-color)">
              Profile Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setCreateImage(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-lg border border-slate-300 bg-(--background-color) px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            <Security fontSize="small" />
            {isSubmitting ? "Creating..." : "Create Employee"}
          </button>
        </form>
      </section>

      <section
        id="update-employee"
        className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <Edit className="text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">
              Update Employee
            </h2>
            <p className="text-sm text-(--text-color)">
              {allowSuperAdminRole
                ? "Super admins can edit the full employee record."
                : "HR can edit phone number, department, designation, and salary only."}
            </p>
          </div>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleUpdateSubmit}
        >
          <InputField
            label="Mongo Record ID"
            value={updateForm.employeeMongoId}
            onChange={handleUpdateChange("employeeMongoId")}
            placeholder="64f..."
          />

          {allowSuperAdminRole ? (
            <>
              <InputField
                label="Employee Name"
                value={updateForm.employeeName}
                onChange={handleUpdateChange("employeeName")}
                placeholder="Updated name"
              />
              <InputField
                label="Employee Email"
                type="email"
                value={updateForm.employeeEmail}
                onChange={handleUpdateChange("employeeEmail")}
                placeholder="updated@company.com"
              />
            </>
          ) : null}

          <InputField
            label="Phone Number"
            value={updateForm.phoneNumber}
            onChange={handleUpdateChange("phoneNumber")}
            placeholder="9876543210"
          />
          <InputField
            label="Designation"
            value={updateForm.designation}
            onChange={handleUpdateChange("designation")}
            placeholder="Lead HR"
          />
          <InputField
            label="Department"
            value={updateForm.department}
            onChange={handleUpdateChange("department")}
            placeholder="Operations"
          />
          <InputField
            label="Salary"
            type="number"
            value={updateForm.salary}
            onChange={handleUpdateChange("salary")}
            placeholder="125000"
          />

          {allowSuperAdminRole ? (
            <>
              <InputField
                label="Joining Date"
                type="date"
                value={updateForm.joiningDate}
                onChange={handleUpdateChange("joiningDate")}
              />
              <SelectField
                label="Status"
                value={updateForm.status}
                onChange={handleUpdateChange("status")}
                options={["active", "inactive"]}
              />
              <InputField
                label="Reporting Manager"
                value={updateForm.reportingManager}
                onChange={handleUpdateChange("reportingManager")}
                placeholder="Manager id"
              />
              <SelectField
                label="Role"
                value={updateForm.role}
                onChange={handleUpdateChange("role")}
                options={roleOptions}
              />
            </>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            <Edit fontSize="small" />
            {isSubmitting ? "Updating..." : "Update Employee"}
          </button>
        </form>
        <p className="mt-3 text-xs text-(--text-color)">
          Allowed update fields: {updateAllowedFields.join(", ")}
        </p>
      </section>

      {allowDelete ? (
        <section
          id="delete-employee"
          className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <Delete className="text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-(--text-color)">
                Delete Employee
              </h2>
              <p className="text-sm text-(--text-color)">
                Uses the protected delete route. Super admin only.
              </p>
            </div>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleDelete}>
            <InputField
              label="Mongo Record ID"
              value={deleteEmployeeId}
              onChange={(event) => setDeleteEmployeeId(event.target.value)}
              placeholder="64f..."
            />
            <div className="md:pt-7">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Delete fontSize="small" />
                {isSubmitting ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section
        id="filters"
        className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <FilterAlt className="text-amber-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">
              Employee Filters
            </h2>
            <p className="text-sm text-(--text-color)">
              Search employees by role, department, designation, or status.
            </p>
          </div>
        </div>

        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleFilter}>
          <SelectField
            label="Filter Type"
            value={filterType}
            onChange={(event) =>
              setFilterType(event.target.value as FilterType)
            }
            options={["role", "department", "designation", "status"]}
          />
          <InputField
            label="Value"
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            placeholder="employee / finance / active"
          />
          <div className="md:pt-7">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search fontSize="small" />
              Run Filter
            </button>
          </div>
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <EmployeeTable employees={filteredEmployees ?? employees} />
        </div>
      </section>

      <section
        id="organization-chart"
        className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <Apartment className="text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">
              Organization Chart
            </h2>
            <p className="text-sm text-(--text-color)">
              Reads the protected organization tree route and renders hierarchy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadOrganizationTree}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Apartment fontSize="small" />
          Load Organization Chart
        </button>

        {organizationTree.length ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-(--background-color)p-4">
            {organizationTree.map((node) => renderTree(node))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-(--text-color)">
            No organization chart loaded yet.
          </p>
        )}
      </section>

      <section
        id="my-profile"
        className="rounded-2xl bg-(--background-color) p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <AccountBox className="text-sky-600" />
          <div>
            <h2 className="text-xl font-semibold text-(--text-color)">
              My Profile
            </h2>
            <p className="text-sm text-(--text-color)">
              Current authenticated employee profile from the backend.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Employee ID" value={profile.employeeId} />
          <InfoCard label="Name" value={profile.employeeName} />
          <InfoCard label="Email" value={profile.employeeEmail} />
          <InfoCard label="Role" value={formatRole(profile.role)} />
          <InfoCard label="Department" value={profile.department ?? "N/A"} />
          <InfoCard label="Designation" value={profile.designation ?? "N/A"} />
        </div>
      </section>

      {actionMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
          {actionData ? (
            <div className="mt-2 text-xs text-emerald-700">
              {Object.entries(actionData).map(([key, value]) => (
                <p key={key}>
                  <span className="font-semibold">{key}:</span> {value}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}
    </div>
  );
};

const renderTree = (node: OrgNode, depth = 0) => (
  <div key={node._id} className="mb-4">
    <div
      className="rounded-xl border border-slate-200 bg-(--background-color) p-4"
      style={{ marginLeft: `${depth * 24}px` }}
    >
      <p className="font-semibold text-(--text-color)">{node.employeeName}</p>
      <p className="text-sm text-(--text-color)">
        {formatRole(node.role)} • {node.designation ?? "N/A"} •{" "}
        {node.department ?? "N/A"}
      </p>
    </div>

    {node.subordinates?.length
      ? node.subordinates.map((subordinate) =>
          renderTree(subordinate, depth + 1)
        )
      : null}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-(--text-color)">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options: string[];
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-(--text-color)">
      {label}
    </span>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const EmployeeTable = ({ employees }: { employees: EmployeeSession[] }) => (
  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
    <thead className="bg-(--background-color)text-(--text-color)">
      <tr>
        <th className="px-4 py-3 font-medium">Employee</th>
        <th className="px-4 py-3 font-medium">Role</th>
        <th className="px-4 py-3 font-medium">Department</th>
        <th className="px-4 py-3 font-medium">Designation</th>
        <th className="px-4 py-3 font-medium">Status</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200 bg-(--background-color)">
      {employees.map((item) => (
        <tr key={item._id}>
          <td className="px-4 py-3">
            <div className="font-medium text-(--text-color)">
              {item.employeeName}
            </div>
            <div className="text-(--text-color)">{item.employeeEmail}</div>
          </td>
          <td className="px-4 py-3">{formatRole(item.role)}</td>
          <td className="px-4 py-3">{item.department ?? "N/A"}</td>
          <td className="px-4 py-3">{item.designation ?? "N/A"}</td>
          <td className="px-4 py-3">{item.status ?? "active"}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-(--background-color)p-4">
    <p className="text-xs uppercase tracking-wide text-(--text-color)">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-(--text-color)">{value}</p>
  </div>
);

export default ManagementDashboard;
