import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, Chip, Button, Card, CardContent } from "@mui/material";
import ParticipantNavbar from "../../components/ParticipantNavbar";
import { useNavigate } from "react-router-dom";

const OrganizerList = () => {
  const [organizers, setOrganizers] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const res = await api.get("/organizers");
    setOrganizers(res.data.organizers || []);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const toggleFollow = async (org) => {
    try {
      if (org.isFollowed) await api.delete(`/profile/follow/${org._id}`);
      else await api.post(`/profile/follow/${org._id}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    }
  };

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Clubs / Organizers</Typography>
        <Stack spacing={2}>
          {organizers.map((o) => (
            <Card key={o._id}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip label={o.organizerCategory || "Organizer"} />
                    <Typography variant="h6" onClick={() => navigate(`/organizers/${o._id}`)} sx={{ cursor: "pointer" }}>
                      {o.organizerName}
                    </Typography>
                  </Stack>
                  <Button variant={o.isFollowed ? "outlined" : "contained"} onClick={() => toggleFollow(o)}>
                    {o.isFollowed ? "Unfollow" : "Follow"}
                  </Button>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{o.organizerDescription}</Typography>
              </CardContent>
            </Card>
          ))}
          {organizers.length === 0 && <Typography color="text.secondary">No organizers found.</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default OrganizerList;