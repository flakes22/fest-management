import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, Card, CardContent, Avatar, Button, Divider, Box, Chip } from "@mui/material";
import OrganizerNavbar from "../../components/OrganizerNavbar";
import { useNavigate } from "react-router-dom";

const OrganizerProfile = () => {
  const [form, setForm] = useState({
    organizerName: "", organizerCategory: "", organizerDescription: "",
    contactEmail: "", contactNumber: "", discordWebhookUrl: "", photoUrl: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/organizer/me").then((res) => {
      const o = res.data.organizer || {};
      setForm({
        organizerName: o.organizerName || "",
        organizerCategory: o.organizerCategory || "",
        organizerDescription: o.organizerDescription || "",
        contactEmail: o.contactEmail || "",
        contactNumber: o.contactNumber || "",
        discordWebhookUrl: o.discordWebhookUrl || "",
        photoUrl: o.photoUrl || ""
      });
    }).catch(() => {});
  }, []);

  const displayName = form.organizerName || "Organizer";

  return (
    <>
      <OrganizerNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Organizer Profile</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          {/* Left: avatar card */}
          <Card sx={{ width: { xs: "100%", md: 320 } }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Avatar src={form.photoUrl || ""} alt={displayName} sx={{ width: 140, height: 140 }}>
                {!form.photoUrl && displayName[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6">{displayName}</Typography>
              <Chip label={form.organizerCategory || "—"} />
              <Button variant="contained" onClick={() => navigate("/organizer/profile/update")} sx={{ mt: 1 }}>
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Right: details (display-only) */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography>{form.organizerName || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography>{form.organizerCategory || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography>{form.organizerDescription || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Contact Email</Typography>
                  <Typography>{form.contactEmail || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                  <Typography>{form.contactNumber || "—"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Discord Webhook</Typography>
                  <Typography>{form.discordWebhookUrl || "—"}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography color="text.secondary">Login email is non-editable and remains your account email.</Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default OrganizerProfile;