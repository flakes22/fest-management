import { useEffect, useState } from "react";
import api from "../api/api";
import { Container, Typography, Stack, Card, CardContent, Button, Alert } from "@mui/material";
import AdminNavbar from "../components/AdminNavbar";

const AdminPasswordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/admin/password-requests");
      setRequests(res.data.requests || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      const res = await api.post(`/admin/password-requests/${id}/approve`);
      setMsg(`Reset approved. New password: ${res.data.newPassword}`);
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to approve");
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/admin/password-requests/${id}/reject`);
      setMsg("Request rejected.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Password Reset Requests</Typography>
        {msg && <Alert severity={msg.startsWith("Reset approved") || msg.includes("rejected") ? "success" : "error"} sx={{ mb: 2 }}>{msg}</Alert>}
        <Stack spacing={2}>
          {requests.map((r) => (
            <Card key={r._id}>
              <CardContent>
                <Typography variant="h6">{r.organizerName || r.email}</Typography>
                <Typography variant="body2" color="text.secondary">Requested at: {new Date(r.requestedAt).toLocaleString()}</Typography>
                <Typography variant="body2">Reason: {r.reason || "—"}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="contained" onClick={() => approve(r._id)}>Approve</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => reject(r._id)}>Reject</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && <Typography color="text.secondary">No pending requests.</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default AdminPasswordRequests;