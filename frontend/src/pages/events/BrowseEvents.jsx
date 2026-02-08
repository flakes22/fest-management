import { useEffect, useMemo, useState } from "react";
import { Container, TextField, Select, MenuItem, FormControlLabel, Checkbox, Button, Stack, Typography, Card, CardContent } from "@mui/material";
import api from "../../api/api";

const BrowseEvents = () => {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [followedOnly, setFollowedOnly] = useState(true);
  const [includeClosed, setIncludeClosed] = useState(false);
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  // debounce placeholder (can be enhanced)
  const debouncedQ = useMemo(() => q, [q]);

  const load = async () => {
    setLoading(true);
    try {
      const baseParams = {
        q: debouncedQ || undefined,
        type: type || undefined,
        eligibility: eligibility || undefined,
        start: start || undefined,
        end: end || undefined,
        includeClosed: includeClosed ? "true" : undefined,
      };

      // first try with followedOrganizers if enabled
      const params = followedOnly
        ? { ...baseParams, followedOrganizers: "true" }
        : baseParams;

      const res = await api.get("/events", { params });
      const list = res.data.events || [];

      // fallback: if followedOnly yields no events, retry without the filter
      if (followedOnly && list.length === 0) {
        const resAll = await api.get("/events", { params: baseParams });
        setEvents(resAll.data.events || []);
      } else {
        setEvents(list);
      }
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const res = await api.get("/events", { params: { trending: "true" } });
      const list = res.data.events || [];
      // Always show up to 5, or fewer if not available
      setTrending(list.slice(0, 5));
    } catch {
      setTrending([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, type, eligibility, start, end, followedOnly, includeClosed]);

  useEffect(() => {
    loadTrending();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Search"
          placeholder="Event or Organizer"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select size="small" value={type} onChange={(e) => setType(e.target.value)} displayEmpty>
          <MenuItem value="">{/* empty */}All Types</MenuItem>
          <MenuItem value="technical">Technical</MenuItem>
          <MenuItem value="cultural">Cultural</MenuItem>
          <MenuItem value="sports">Sports</MenuItem>
        </Select>
        <Select size="small" value={eligibility} onChange={(e) => setEligibility(e.target.value)} displayEmpty>
          <MenuItem value="">{/* empty */}All Eligibility</MenuItem>
          <MenuItem value="students">Students</MenuItem>
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="alumni">Alumni</MenuItem>
        </Select>
        <TextField
          size="small"
          type="date"
          label="Start"
          InputLabelProps={{ shrink: true }}
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="End"
          InputLabelProps={{ shrink: true }}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <FormControlLabel
          control={<Checkbox checked={followedOnly} onChange={(e) => setFollowedOnly(e.target.checked)} />}
          label="Followed Clubs"
        />
        <FormControlLabel
          control={<Checkbox checked={includeClosed} onChange={(e) => setIncludeClosed(e.target.checked)} />}
          label="Show All"
        />
        <Button variant="outlined" onClick={load}>Refresh</Button>
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>Trending (Last 24h)</Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {/* {trending.length === 0 && (
          <Typography color="text.secondary">No trending events yet.</Typography>
        )} */}
        {trending.map((ev) => (
          <Card key={ev._id}>
            <CardContent>
              <Typography variant="subtitle1">{ev.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {ev.type} • {ev.organizer?.organizerName} • {new Date(ev.startDate).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>Browse</Typography>
      <Stack spacing={2}>
        {events.length === 0 && (
          <Typography color="text.secondary">
            No events found{followedOnly ? " for followed clubs. Try disabling the filter." : "."}
          </Typography>
        )}
        {events.map((ev) => (
          <Card key={ev._id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">{ev.name}</Typography>
                <Button size="small" href={`/events/${ev._id}`}>Open</Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {ev.type} • {ev.organizer?.organizerName} • {new Date(ev.startDate).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default BrowseEvents;
