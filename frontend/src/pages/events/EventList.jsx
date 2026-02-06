import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { Container, Stack, Typography, Card, CardContent, TextField, Button, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ParticipantNavbar from "../../components/ParticipantNavbar";
import Fuse from "fuse.js";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [followedOnly, setFollowedOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    const params = { onlyPublished: showAll ? undefined : "true" };
    const res = await api.get("/events", { params });
    setEvents(res.data.events || []);
  };
  const loadTrending = async () => {
    const res = await api.get("/events/trending", { params: { window: "24h", top: 5 } });
    setTrending(res.data.events || []);
  };

  useEffect(() => {
    Promise.allSettled([load(), loadTrending()]);
  }, [showAll]);

  useEffect(() => {
    api.get("/events?status=published,ongoing").then((res) => {
      const events = (res.data.events || []).filter((e) => ["published", "ongoing"].includes(e.status));
      setEvents(events);
    }).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    api.get("/events", { params: { onlyPublished: "true" } }).then((res) => {
      setEvents(res.data.events || []);
    }).catch(() => setEvents([]));
  }, []);

  const filtered = useMemo(() => {
    let list = [...events];
    // Followed clubs filter
    if (followedOnly) list = list.filter((e) => e.organizer?.isFollowed);
    // Type filter
    if (type) list = list.filter((e) => e.type === type);
    // Eligibility filter
    if (eligibility) list = list.filter((e) => (e.eligibility || "").toLowerCase().includes(eligibility.toLowerCase()));
    // Date range filter
    if (startDate) list = list.filter((e) => new Date(e.startDate) >= new Date(startDate));
    if (endDate) list = list.filter((e) => new Date(e.endDate) <= new Date(endDate));
    // Fuzzy search over event and organizer name
    if (search.trim()) {
      const fuse = new Fuse(list, { keys: ["name", "organizer.organizerName"], threshold: 0.4, ignoreLocation: true });
      list = fuse.search(search.trim()).map((r) => r.item);
    }
    return list;
  }, [events, search, type, eligibility, startDate, endDate, followedOnly]);

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Browse Events</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <TextField size="small" label="Search events or organizers" value={search} onChange={(e) => setSearch(e.target.value)} />
          <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="merchandise">Merchandise</MenuItem>
          </TextField>
          <TextField size="small" label="Eligibility" value={eligibility} onChange={(e) => setEligibility(e.target.value)} />
          <TextField size="small" label="Start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="End" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <FormControlLabel control={<Checkbox checked={followedOnly} onChange={(e) => setFollowedOnly(e.target.checked)} />} label="Followed Clubs" />
          <FormControlLabel control={<Checkbox checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />} label="Show All (incl. drafts/closed)" />
          <Button variant="outlined" onClick={load}>Refresh</Button>
        </Stack>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Trending (Top 5 / 24h)</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          {trending.map((e) => (
            <Button key={e._id} variant="text" onClick={() => navigate(`/events/${e._id}`)}>{e.name}</Button>
          ))}
          {trending.length === 0 && <Typography color="text.secondary">No trending events.</Typography>}
        </Stack>

        <Stack spacing={2}>
          {filtered.map((e) => (
            <Card key={e._id} onClick={() => navigate(`/events/${e._id}`)} sx={{ cursor: "pointer" }}>
              <CardContent>
                <Typography variant="h6">{e.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.type} • {e.organizer?.organizerName || "Organizer"} • {new Date(e.startDate).toLocaleDateString()} → {new Date(e.endDate).toLocaleDateString()} • status {e.status}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <Typography color="text.secondary">No events found.</Typography>}
        </Stack>
      </Container>
    </>
  );
};

export default EventList;