
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
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
      await register(form);

      navigate("/");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
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

        <h1 className="text-3xl font-bold">
          Create Account
        </h1>

        <p className="text-slate-500 mt-2">
          Register as a passenger to book bus tickets.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-5 text-sm">
            {error}
          </div>
        )}

        <div className="mt-7">
          <label className="block text-sm font-semibold mb-2">
            Full Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="Enter your full name"
            className="w-full border border-slate-300 rounded-lg p-3"
          />
        </div>

        <div className="mt-5">
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
            className="w-full border border-slate-300 rounded-lg p-3"
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
            minLength={8}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="w-full border border-slate-300 rounded-lg p-3"
          />

          <p className="text-xs text-slate-500 mt-2">
            Minimum 8 characters, including uppercase,
            lowercase and a number.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-7 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-blue-700 font-semibold"
          >
            Login
          </Link>
        </p>

      </form>
    </div>
  );
};

export default Register;
