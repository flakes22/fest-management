import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { Container, Typography, Stack, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import OrganizerNavbar from "../../components/OrganizerNavbar";

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({});
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await api.get(`/events/${id}`);
    setEvent(res.data.event);
    const s = await api.get(`/events/${id}/analytics`);
    setStats(s.data || {});
    const p = await api.get(`/events/${id}/participants`);
    setParticipants(p.data.participants || []);
  };

  useEffect(() => { load().catch(() => {}); }, [id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.teamName || "").toLowerCase().includes(q)
    );
  }, [participants, search]);

  const exportCsv = () => {
    const rows = [["Name","Email","Reg Date","Payment","Team","Attendance"]];
    filtered.forEach((p) => rows.push([
      p.name || "", p.email || "", new Date(p.registeredAt).toISOString(),
      p.paymentStatus || "", p.teamName || "", p.attended ? "Yes" : "No"
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `participants_${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!event) return <Container sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <>
      <OrganizerNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">{event.name}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => window.location.assign(`/organizer/events/${id}/edit`)}>Edit Event</Button>
          </Stack>
        </Stack>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">Overview</Typography>
            <Typography color="text.secondary">
              Type: {event.type} • Status: {event.status} • Eligibility: {event.eligibility || "—"} • Fee: ₹{event.registrationFee || 0}
            </Typography>
            <Typography color="text.secondary">{new Date(event.startDate).toLocaleString()} → {new Date(event.endDate).toLocaleString()}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">Analytics</Typography>
            <Stack direction="row" spacing={3}>
              <Typography>Registrations: {stats.registrations || 0}</Typography>
              <Typography>Sales: {stats.sales || 0}</Typography>
              <Typography>Attendance: {stats.attendance || 0}</Typography>
              <Typography>Revenue: ₹{stats.revenue || 0}</Typography>
              <Typography>Teams Completed: {stats.teamsCompleted || 0}</Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Participants</Typography>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="Search by name/email/team" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button onClick={exportCsv}>Export CSV</Button>
              </Stack>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Reg Date</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Attendance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{new Date(p.registeredAt).toLocaleString()}</TableCell>
                    <TableCell>{p.paymentStatus || "—"}</TableCell>
                    <TableCell>{p.teamName || "—"}</TableCell>
                    <TableCell>{p.attended ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6}>No participants</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default OrganizerEventDetail;