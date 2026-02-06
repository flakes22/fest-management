import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Stack, Typography, Button, Card, CardContent, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import OrganizerNavbar from "../../components/OrganizerNavbar";

const OrganizerDashboard = ({ onLogout }) => {
  const [myEvents, setMyEvents] = useState([]);
  const [analytics, setAnalytics] = useState({ registrations: 0, sales: 0, revenue: 0, attendance: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/events?mine=true");
      setMyEvents(res.data.events || []);
      const a = await api.get("/organizer/analytics/summary"); // completed events summary
      setAnalytics(a.data || { registrations: 0, sales: 0, revenue: 0, attendance: 0 });
    };
    load().catch(() => {});
  }, []);

  const handleLogout = () => { onLogout(); navigate("/"); };

  return (
    <>
      <OrganizerNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Organizer Dashboard</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => navigate("/organizer/events/new")}>Create Event</Button>
            <Button variant="outlined" onClick={() => navigate("/organizer/ongoing")}>Ongoing Events</Button>
          </Stack>
        </Stack>

        <Typography variant="h6" sx={{ mb: 1 }}>My Events</Typography>
        <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
          {myEvents.map((e) => (
            <Card key={e._id} sx={{ minWidth: 300, flex: "0 0 auto" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{e.name}</Typography>
                  <Button size="small" variant="text" onClick={() => navigate(`/organizer/events/${e._id}`)}>Manage</Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {e.type} • {new Date(e.startDate).toLocaleDateString()} → {new Date(e.endDate).toLocaleDateString()}
                </Typography>
                <Chip size="small" label={`Status: ${e.status}`} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
          {myEvents.length === 0 && <Typography color="text.secondary">No events found.</Typography>}
        </Stack>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Event Analytics (Completed)</Typography>
        <Stack direction="row" spacing={3}>
          <Card sx={{ flex: 1 }}><CardContent><Typography>Registrations</Typography><Typography variant="h5">{analytics.registrations}</Typography></CardContent></Card>
          <Card sx={{ flex: 1 }}><CardContent><Typography>Sales</Typography><Typography variant="h5">{analytics.sales}</Typography></CardContent></Card>
          <Card sx={{ flex: 1 }}><CardContent><Typography>Revenue</Typography><Typography variant="h5">₹{analytics.revenue}</Typography></CardContent></Card>
          <Card sx={{ flex: 1 }}><CardContent><Typography>Attendance</Typography><Typography variant="h5">{analytics.attendance}</Typography></CardContent></Card>
        </Stack>
      </Container>
    </>
  );
};

export default OrganizerDashboard;