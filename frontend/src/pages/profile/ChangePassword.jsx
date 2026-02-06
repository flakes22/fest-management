import { useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, TextField, Button } from "@mui/material";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      alert("Password changed");
      setCurrentPassword(""); setNewPassword("");
    } catch (e2) {
      alert(e2?.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Change Password</Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          <TextField type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <TextField type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" variant="contained">Update</Button>
        </Stack>
      </form>
    </Container>
  );
};

export default ChangePassword;