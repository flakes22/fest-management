import { AppBar, Toolbar, Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const ParticipantNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const go = (path) => {
    if (location.pathname !== path) navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to Home
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Button color="inherit" onClick={() => go("/dashboard")}>Dashboard</Button>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => go("/events")}>Browse Events</Button>
          <Button color="inherit" onClick={() => go("/organizers")}>Clubs/Organizers</Button>
          <Button color="inherit" onClick={() => go("/profile")}>Profile</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default ParticipantNavbar;