import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/client";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    API.get("/auth/me/")
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!authenticated) return <Navigate to="/" />;

  return children;
}