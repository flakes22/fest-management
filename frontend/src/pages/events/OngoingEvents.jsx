import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, Card, CardContent, Button, Chip } from "@mui/material";
import OrganizerNavbar from "../../components/OrganizerNavbar";
import { useNavigate } from "react-router-dom";

const OngoingEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events?mine=true&status=ongoing").then((res) => {
      setEvents((res.data.events || []).filter((e) => e.status === "ongoing"));
    }).catch(() => setEvents([]));
  }, []);

  return (
    <>
      <OrganizerNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Ongoing Events</Typography>
        <Stack spacing={2}>
          {events.map((e) => (
            <Card key={e._id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{e.name}</Typography>
                  <Button size="small" variant="text" onClick={() => navigate(`/organizer/events/${e._id}`)}>Manage</Button>
                </Stack>
                <Typography color="text.secondary">{new Date(e.startDate).toLocaleString()} → {new Date(e.endDate).toLocaleString()}</Typography>
                <Chip size="small" label={`Status: ${e.status}`} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && <Typography color="text.secondary">None</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default OngoingEvents;