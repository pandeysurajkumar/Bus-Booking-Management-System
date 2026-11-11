
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        const result = await login(form);

        const destinations = {
        passenger: "/",
        admin: "/admin",
        operator: "/operator",
        staff: "/staff"
        };

        navigate(
        destinations[result.user.role] || "/unauthorized",
        { replace: true }
        );

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to login. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 py-12">

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 w-full max-w-md"
      >

        <p className="text-xs font-bold tracking-[0.2em] text-blue-700">
          BUSGO
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Welcome Back
        </h1>

        <p className="text-slate-500 mt-2">
          Sign in to search trips, manage bookings, or open your workspace.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-5 text-sm">
            {error}
          </div>
        )}

        <div className="mt-7">
          <label className="block text-sm font-semibold mb-2">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-5">
          <label className="block text-sm font-semibold mb-2">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-7 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-700 font-semibold"
          >
            Register
          </Link>
        </p>

      </form>
    </div>
  );
};

export default Login;
