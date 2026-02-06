import { AppBar, Toolbar, Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const OrganizerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const go = (path) => { if (location.pathname !== path) navigate(path); };
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => go("/dashboard")}>Dashboard</Button>
          <Button color="inherit" onClick={() => go("/organizer/events/new")}>Create Event</Button>
          <Button color="inherit" onClick={() => go("/organizer/ongoing")}>Ongoing Events</Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => go("/organizer/profile")}>Profile</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default OrganizerNavbar;