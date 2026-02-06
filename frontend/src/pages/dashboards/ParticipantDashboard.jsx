import { useEffect, useState } from "react";
import { Container, Typography, Stack, Card, CardContent, Tabs, Tab, Button, Chip } from "@mui/material";
import ParticipantNavbar from "../../components/ParticipantNavbar";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const ParticipantDashboard = ({ onLogout }) => {
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("normal");
  const navigate = useNavigate();

  const loadUpcoming = async () => {
    const res = await api.get("/registrations/me/upcoming"); // backend should filter upcoming by date
    setUpcoming(res.data.records || []);
  };
  const loadHistory = async () => {
    const res = await api.get("/registrations/me/history"); // returns all history records
    setHistory(res.data.records || []);
  };

  useEffect(() => {
    Promise.allSettled([loadUpcoming(), loadHistory()]);
  }, []);

  const filteredHistory = history.filter((r) => {
    if (tab === "normal") return r.type === "normal" && ["registered", "approved"].includes(r.status);
    if (tab === "merchandise") return r.type === "merchandise";
    if (tab === "completed") return r.status === "completed";
    if (tab === "cancelled") return ["cancelled", "rejected"].includes(r.status);
    return true;
  });

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">My Events</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/events")}>Browse Events</Button>
            <Button variant="text" onClick={() => navigate("/preferences")}>Manage Preferences</Button>
          </Stack>
        </Stack>

        <Typography variant="h6" sx={{ mb: 1 }}>Upcoming</Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {upcoming.map((r) => (
            <Card key={r._id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{r.event?.name}</Typography>
                  <Button size="small" onClick={() => navigate(`/events/${r.event?._id}`)}>Details</Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {r.event?.type} • {r.event?.organizer?.organizerName} • {new Date(r.event?.startDate).toLocaleString()}
                </Typography>
                {r.teamName && <Chip size="small" label={`Team: ${r.teamName}`} sx={{ mt: 1 }} />}
              </CardContent>
            </Card>
          ))}
          {upcoming.length === 0 && <Typography color="text.secondary">No upcoming registrations.</Typography>}
        </Stack>

        <Typography variant="h6" sx={{ mb: 1 }}>Participation History</Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab value="normal" label="Normal" />
          <Tab value="merchandise" label="Merchandise" />
          <Tab value="completed" label="Completed" />
          <Tab value="cancelled" label="Cancelled/Rejected" />
        </Tabs>

        <Stack spacing={2}>
          {filteredHistory.map((r) => (
            <Card key={r._id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{r.event?.name}</Typography>
                  <Button size="small" onClick={() => navigate(`/events/${r.event?._id}`)}>Open</Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Type: {r.type} • Organizer: {r.event?.organizer?.organizerName} • Status: {r.status}
                </Typography>
                {r.teamName && <Typography variant="body2">Team: {r.teamName}</Typography>}
                {r.ticketId && (
                  <Button size="small" variant="text" onClick={() => navigate(`/tickets/${r.ticketId}`)}>
                    Ticket: {r.ticketId}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredHistory.length === 0 && <Typography color="text.secondary">No records.</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default ParticipantDashboard;