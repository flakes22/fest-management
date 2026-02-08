import { useEffect, useState } from "react";
import api from "../api/api";
import { Container, Typography, Stack, Card, CardContent, Button, Alert, Chip } from "@mui/material";
import AdminNavbar from "../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

const AdminOrganizerManagement = () => {
  const [orgs, setOrgs] = useState([]);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await api.get("/admin/organizers"); // GET list
      setOrgs(res.data.organizers || []);
    } catch {
      setOrgs([]);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Remove this organizer?")) return;
    try {
      await api.delete(`/admin/organizers/${id}`); // hard delete or archive per backend
      setMsg("Organizer removed.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to remove");
    }
  };

  const disable = async (id) => {
    try {
      await api.post(`/admin/organizers/${id}/disable`); // disable login
      setMsg("Organizer disabled.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to disable");
    }
  };

  const enable = async (id) => {
    try {
      await api.post(`/admin/organizers/${id}/enable`);
      setMsg("Organizer enabled.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to enable");
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">Manage Clubs/Organizers</Typography>
          <Button variant="contained" onClick={() => navigate("/admin/organizers/new")}>Add New</Button>
        </Stack>
        {msg && <Alert severity={/removed|disabled|enabled/.test(msg) ? "success" : "error"} sx={{ mb: 2 }}>{msg}</Alert>}
        <Stack spacing={2}>
          {orgs.map((o) => (
            <Card key={o._id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="h6">{o.organizerName}</Typography>
                    <Typography variant="body2" color="text.secondary">{o.organizerCategory}</Typography>
                    <Typography variant="body2">{o.email || o.contactEmail}</Typography>
                    {o.disabled && <Chip size="small" label="Disabled" color="warning" sx={{ mt: 1 }} />}
                  </div>
                  <Stack direction="row" spacing={1}>
                    {o.disabled
                      ? <Button variant="outlined" onClick={() => enable(o._id)}>Enable</Button>
                      : <Button variant="outlined" color="warning" onClick={() => disable(o._id)}>Disable</Button>}
                    <Button variant="outlined" color="error" onClick={() => remove(o._id)}>Remove</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {orgs.length === 0 && <Typography color="text.secondary">No organizers found.</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default AdminOrganizerManagement;