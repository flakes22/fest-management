import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleRoute = ({ roles = [], children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

export default RoleRoute;