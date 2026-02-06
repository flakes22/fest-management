import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, Button, Chip, Card, CardContent, Avatar, Divider, Box } from "@mui/material";
import ParticipantNavbar from "../../components/ParticipantNavbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", contactNumber: "", college: "",
    email: "", participantType: "", interests: [], followedOrganizers: [], photoUrl: ""
  });
  const navigate = useNavigate();

  const load = async () => {
    const res = await api.get("/profile/me");
    // backend returns { user } from PUT and typically { profile } from GET; support both
    const p = res.data.profile || res.data.user || {};
    setForm({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      contactNumber: p.contactNumber || "",
      college: p.college || "",
      email: p.email || "",
      participantType: p.participantType || "",
      interests: p.interests || [],
      followedOrganizers: (p.followedOrganizers || []).map((o) =>
        typeof o === "string" ? o : o?.organizerName || o?._id
      ),
      photoUrl: p.photoUrl || ""
    });
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ") || "Participant";

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Profile</Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          {/* Left: avatar card */}
          <Card sx={{ width: { xs: "100%", md: 320 } }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Avatar src={form.photoUrl || ""} alt={fullName} sx={{ width: 140, height: 140 }}>
                {!form.photoUrl && fullName[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6">{fullName}</Typography>
              <Typography color="text.secondary">{form.email}</Typography>
              <Typography color="text.secondary">Type: {form.participantType || "—"}</Typography>
              <Button variant="contained" onClick={() => navigate("/profile/update")} sx={{ mt: 1 }}>
                Update Profile
              </Button>
              <Button variant="text" onClick={() => navigate("/change-password")}>
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Right: details (display-only, no boxes) */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">First Name</Typography>
                  <Typography>{form.firstName || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Name</Typography>
                  <Typography>{form.lastName || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                  <Typography>{form.contactNumber || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">College/Organization</Typography>
                  <Typography>{form.college || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography>{form.email || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Participant Type</Typography>
                  <Typography>{form.participantType || "—"}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Selected Interests</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
                {form.interests.map((t) => <Chip key={t} label={t} />)}
                {form.interests.length === 0 && <Typography color="text.secondary">None</Typography>}
              </Stack>

              <Typography variant="h6" sx={{ mb: 1 }}>Followed Clubs</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {form.followedOrganizers.map((o, idx) => <Chip key={`${o}-${idx}`} label={o} />)}
                {form.followedOrganizers.length === 0 && <Typography color="text.secondary">None</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default Profile;