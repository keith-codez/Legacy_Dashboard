import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await login(form);

      const role = res.data.role;

      if (role === "owner") {
        navigate("/owner");
      } else {
        navigate("/manager");
      }

    } catch {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}