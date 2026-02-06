import { useAuth } from "../context/authContext";
import ParticipantDashboard from "./dashboards/ParticipantDashboard";
import OrganizerDashboard from "./dashboards/OrganizerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const Dashboard = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role;
  return (
    <>
      {role === "participant" && <ParticipantDashboard onLogout={logout} />}
      {role === "organizer" && <OrganizerDashboard onLogout={logout} />}
      {role === "admin" && <AdminDashboard onLogout={logout} />}
    </>
  );
};

export default Dashboard;
