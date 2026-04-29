import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/client";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/" replace />;

  const role = user.role;

  // HARD BLOCK CROSS-ROLE ACCESS
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirect = role === "shareholder" ? "/owner" : "/manager";
    return <Navigate to={redirect} replace />;
  }

  return children;
}