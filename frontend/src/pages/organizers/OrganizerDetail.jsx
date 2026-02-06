import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { Container, Typography, Stack, Button, Card, CardContent } from "@mui/material";
import ParticipantNavbar from "../../components/ParticipantNavbar";

const OrganizerDetail = () => {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);

  const load = async () => {
    const res = await api.get(`/organizers/${id}`);
    setOrg(res.data.organizer);
    const e = res.data.events || [];
    const now = new Date();
    setUpcoming(e.filter((ev) => new Date(ev.endDate) >= now));
    setPast(e.filter((ev) => new Date(ev.endDate) < now));
  };

  useEffect(() => { load().catch(() => {}); }, [id]);

  const toggleFollow = async () => {
    if (!org) return;
    try {
      if (org.isFollowed) await api.delete(`/profile/follow/${org._id}`);
      else await api.post(`/profile/follow/${org._id}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    }
  };

  if (!org) return <Container sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{org.organizerName}</Typography>
          <Button variant={org.isFollowed ? "outlined" : "contained"} onClick={toggleFollow}>
            {org.isFollowed ? "Unfollow" : "Follow"}
          </Button>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {org.organizerCategory} • {org.organizerDescription}
        </Typography>
        <Typography sx={{ mb: 1 }}>Contact: {org.contactEmail || "N/A"}</Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Upcoming Events</Typography>
        <Stack spacing={2}>
          {upcoming.map((e) => (
            <Card key={e._id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{e.name}</Typography>
                  <Button size="small" onClick={() => window.location.assign(`/events/${e._id}`)}>Open</Button>
                </Stack>
                <Typography color="text.secondary">{new Date(e.startDate).toLocaleString()} → {new Date(e.endDate).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          ))}
          {upcoming.length === 0 && <Typography color="text.secondary">None</Typography>}
        </Stack>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Past Events</Typography>
        <Stack spacing={2}>
          {past.map((e) => (
            <Card key={e._id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{e.name}</Typography>
                  <Button size="small" onClick={() => window.location.assign(`/events/${e._id}`)}>Open</Button>
                </Stack>
                <Typography color="text.secondary">{new Date(e.startDate).toLocaleString()} → {new Date(e.endDate).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          ))}
          {past.length === 0 && <Typography color="text.secondary">None</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default OrganizerDetail;