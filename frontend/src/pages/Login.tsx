import { type FormEvent, useState } from "react";
import type { EmployeeSession } from "../types/employee";

type LoginProps = {
  onLoginSuccess: (token: string, employee: EmployeeSession) => void;
  onRegisterSuperUserClick: () => void;
};

const Login = ({ onLoginSuccess, onRegisterSuperUserClick }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          employeeEmail: email,
          password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || "Login failed. Please try again.");
      }

      const token = responseData?.data?.accessToken;
      const employee = responseData?.data?.employee as EmployeeSession | undefined;

      if (!token || !employee) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      onLoginSuccess(token, employee);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-6 rounded shadow-2xl">
          <h1 className="text-center text-4xl font-bold text-slate-800/80 ">
            EMS
          </h1>
          <h2 className="text-2xl font-bold text-slate-800/80">
            Secure Access
          </h2>
          <p className="text-slate-600/80">
            Please enter your credentials to access the system.
          </p>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-slate-400/80  rounded focus:outline-none"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-slate-400/80  rounded focus:outline-none"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 text-white bg-green-500/80 rounded hover:bg-green-500 focus:outline-none focus:ring focus:border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </div>
            <p className="text-center text-sm text-slate-700">
              Need to create a super user?{" "}
              <button
                type="button"
                onClick={onRegisterSuperUserClick}
                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Register Super User
              </button>
            </p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
