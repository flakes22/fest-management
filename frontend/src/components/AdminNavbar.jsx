import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          Admin Panel
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button color="inherit" onClick={() => navigate("/admin/organizers")}>Manage Organizers</Button>
          <Button color="inherit" onClick={() => navigate("/admin/password-requests")}>Password Resets</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;