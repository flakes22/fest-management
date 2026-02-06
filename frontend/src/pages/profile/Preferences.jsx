import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, Chip, Button } from "@mui/material";

const Preferences = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get("/organizers");
    setOrganizers(res.data.organizers || []);
    setLoading(false);
  };

  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const toggleFollow = async (org) => {
    try {
      if (org.isFollowed) {
        await api.delete(`/profile/follow/${org._id}`);
        alert("Unfollowed");
      } else {
        await api.post(`/profile/follow/${org._id}`);
        alert("Followed");
      }
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <Container sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Organizers</Typography>
      <Stack spacing={2}>
        {organizers.map((o) => (
          <Stack key={o._id} direction="row" spacing={2} alignItems="center">
            <Chip label={o.organizerCategory || "Organizer"} />
            <Typography sx={{ minWidth: 220 }}>{o.organizerName}</Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>{o.organizerDescription}</Typography>
            <Button variant={o.isFollowed ? "outlined" : "contained"} onClick={() => toggleFollow(o)}>
              {o.isFollowed ? "Unfollow" : "Follow"}
            </Button>
          </Stack>
        ))}
        {organizers.length === 0 && <Typography color="text.secondary">No organizers found.</Typography>}
      </Stack>
    </Container>
  );
};

export default Preferences;