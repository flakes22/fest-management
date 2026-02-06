import { useNavigate } from "react-router-dom";
import { Container, Stack, Typography, Button, Card, CardContent } from "@mui/material";

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/"); // Home
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout</Button>
      </Stack>
    </Container>
  );
};

export default AdminDashboard;