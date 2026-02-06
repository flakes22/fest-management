import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, Chip, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DEFAULT_INTERESTS = [
  "robotics", "workshop", "coding", "design", "talks", "music", "sports", "gaming", "arts"
];

const OnboardingPreferences = () => {
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState(new Set());
  const [interests, setInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadOrganizers = async () => {
    const res = await api.get("/organizers");
    setOrganizers(res.data.organizers || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrganizers().catch(() => setLoading(false));
  }, []);

  const toggleOrganizer = (id) => {
    setSelectedOrganizers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleInterest = (tag) => {
    setInterests((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      return [...prev, tag];
    });
  };

  const addCustomInterest = () => {
    const val = customInterest.trim();
    if (!val) return;
    if (!interests.includes(val)) setInterests([...interests, val]);
    setCustomInterest("");
  };

  const skip = () => navigate("/dashboard");

  const save = async () => {
    try {
      await api.put("/profile/preferences", {
        interests,
        followedOrganizers: Array.from(selectedOrganizers)
      });
      navigate("/dashboard");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save preferences");
    }
  };

  if (loading) return <Container sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Set Your Preferences</Typography>

      <Typography variant="h6" sx={{ mb: 1 }}>Areas of Interest</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
        {DEFAULT_INTERESTS.map((t) => (
          <Chip
            key={t}
            label={t}
            color={interests.includes(t) ? "primary" : "default"}
            onClick={() => toggleInterest(t)}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField
          size="small"
          label="Add custom interest"
          value={customInterest}
          onChange={(e) => setCustomInterest(e.target.value)}
        />
        <Button variant="outlined" onClick={addCustomInterest}>Add</Button>
      </Stack>
      {interests.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 4 }}>
          {interests.map((t) => (
            <Chip key={t} label={t} color="primary" onDelete={() => toggleInterest(t)} />
          ))}
        </Stack>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>Clubs / Organizers to Follow</Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {organizers.map((o) => {
          const selected = selectedOrganizers.has(o._id);
          return (
            <Stack key={o._id} direction="row" spacing={2} alignItems="center">
              <Chip label={o.organizerCategory || "Organizer"} />
              <Typography sx={{ minWidth: 220 }}>{o.organizerName}</Typography>
              <Typography color="text.secondary" sx={{ flex: 1 }}>{o.organizerDescription}</Typography>
              <Button variant={selected ? "outlined" : "contained"} onClick={() => toggleOrganizer(o._id)}>
                {selected ? "Unfollow" : "Follow"}
              </Button>
            </Stack>
          );
        })}
        {organizers.length === 0 && <Typography color="text.secondary">No organizers found.</Typography>}
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button variant="text" onClick={skip}>Skip</Button>
        <Button variant="contained" onClick={save}>Save & Continue</Button>
      </Stack>
    </Container>
  );
};

export default OnboardingPreferences;