import { type ChangeEvent, useState } from "react";

type RegisterSuperAdminProps = {
	onRegistrationSuccess: () => void;
};

type RegisterFormState = {
	employeeId: string;
	employeeName: string;
	employeeEmail: string;
	password: string;
	confirmPassword: string;
	phoneNumber: string;
	designation: string;
	department: string;
	salary: string;
	joiningDate: string;
};

const initialFormState: RegisterFormState = {
	employeeId: "",
	employeeName: "",
	employeeEmail: "",
	password: "",
	confirmPassword: "",
	phoneNumber: "",
	designation: "",
	department: "",
	salary: "",
	joiningDate: "",
};

const RegisterSuperAdmin = ({ onRegistrationSuccess }: RegisterSuperAdminProps) => {
	const [formData, setFormData] = useState<RegisterFormState>(initialFormState);
	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleInputChange =
		(field: keyof RegisterFormState) => (event: ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, [field]: event.target.value }));
		};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] ?? null;
		setProfileImage(selectedFile);
	};

	const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setSuccess("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (Number(formData.salary) <= 0) {
			setError("Salary must be greater than 0.");
			return;
		}

		setIsLoading(true);

		try {
			const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

			const payload = new FormData();
			payload.append("employeeId", formData.employeeId.trim());
			payload.append("employeeName", formData.employeeName.trim());
			payload.append("employeeEmail", formData.employeeEmail.trim());
			payload.append("password", formData.password);
			payload.append("phoneNumber", formData.phoneNumber.trim());
			payload.append("designation", formData.designation.trim());
			payload.append("department", formData.department.trim());
			payload.append("salary", formData.salary.trim());
			payload.append("joiningDate", formData.joiningDate);
			payload.append("role", "super_admin");

			if (profileImage) {
				payload.append("profileImage", profileImage);
			}

			const response = await fetch(`${apiBaseUrl}/employees/create-super-admin`, {
				method: "POST",
				body: payload,
				credentials: "include",
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result?.message ?? "Failed to register super admin.");
			}

			setSuccess(result?.message ?? "Super admin registered successfully.");
			setFormData(initialFormState);
			setProfileImage(null);

			window.setTimeout(() => {
				onRegistrationSuccess();
			}, 1000);
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Something went wrong while creating the super admin."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-(--background-color) text-(--text-color) px-4 py-10">
			<div className="mx-auto w-full max-w-3xl rounded-2xl bg-(--background-color) p-8 shadow-xl">
				<h1 className="text-3xl font-bold">Register Super Admin</h1>
				<p className="mt-2">
					Fill in all details to create the first super admin account.
				</p>

				<form className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Employee ID</span>
						<input
							type="text"
							value={formData.employeeId}
							onChange={handleInputChange("employeeId")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="EMP-001"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Full Name</span>
						<input
							type="text"
							value={formData.employeeName}
							onChange={handleInputChange("employeeName")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="Alex Morgan"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Email</span>
						<input
							type="email"
							value={formData.employeeEmail}
							onChange={handleInputChange("employeeEmail")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="admin@company.com"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Phone Number</span>
						<input
							type="text"
							value={formData.phoneNumber}
							onChange={handleInputChange("phoneNumber")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="9876543210"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Designation</span>
						<input
							type="text"
							value={formData.designation}
							onChange={handleInputChange("designation")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="Chief Administrator"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Department</span>
						<input
							type="text"
							value={formData.department}
							onChange={handleInputChange("department")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="Operations"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Salary</span>
						<input
							type="number"
							min="1"
							value={formData.salary}
							onChange={handleInputChange("salary")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="120000"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Joining Date</span>
						<input
							type="date"
							value={formData.joiningDate}
							onChange={handleInputChange("joiningDate")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Password</span>
						<input
							type="password"
							value={formData.password}
							onChange={handleInputChange("password")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="Enter password"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Confirm Password</span>
						<input
							type="password"
							value={formData.confirmPassword}
							onChange={handleInputChange("confirmPassword")}
							required
							className="w-full rounded-md border border-slate-300 px-3 py-2 bg-(--search-bar-background) text-(--search-bar-text-color) outline-none ring-emerald-200 focus:ring"
							placeholder="Confirm password"
						/>
					</label>

					<label className="block md:col-span-2">
						<span className="mb-1 block text-sm font-medium text-(--text-color)">Profile Image (Optional)</span>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="w-full rounded-md border border-slate-300 bg-(--search-bar-background) text-(--search-bar-text-color) px-3 py-2 text-sm"
						/>
					</label>

					<div className="md:col-span-2">
						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isLoading ? "Registering..." : "Register Super Admin"}
						</button>
					</div>

					{error ? (
						<p className="text-sm font-medium text-red-600 md:col-span-2">{error}</p>
					) : null}

					{success ? (
						<p className="text-sm font-medium text-emerald-600 md:col-span-2">{success}</p>
					) : null}
				</form>
			</div>
		</div>
	);
};

export default RegisterSuperAdmin;
