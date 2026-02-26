// src/pages/Login.jsx
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // dummy login
    navigate("/manager");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Login</h1>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login (Dummy)
        </button>
      </div>
    </div>
  );
}