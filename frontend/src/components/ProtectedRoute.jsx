import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { firebaseUser, profile, role, loading } = useAuth();

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/no-access" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;

  return children;
}