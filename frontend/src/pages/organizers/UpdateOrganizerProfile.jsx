import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, TextField, Button, Alert } from "@mui/material";
import OrganizerNavbar from "../../components/OrganizerNavbar";
import { useNavigate } from "react-router-dom";

const UpdateOrganizerProfile = () => {
  const [form, setForm] = useState({
    organizerName: "", organizerCategory: "", organizerDescription: "",
    contactEmail: "", contactNumber: "", discordWebhookUrl: "", photoUrl: ""
  });
  const [msg, setMsg] = useState("");
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

  const onChange = (e) => setMsg("") || setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      // Map contactEmail to organizerContactEmail for backend
      await api.put("/organizer/me", {
        organizerName: form.organizerName,
        organizerCategory: form.organizerCategory,
        organizerDescription: form.organizerDescription,
        organizerContactEmail: form.contactEmail,
        contactNumber: form.contactNumber,
        discordWebhookUrl: form.discordWebhookUrl,
        photoUrl: form.photoUrl
      });
      setMsg("Profile updated.");
      navigate("/organizer/profile");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <OrganizerNavbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Update Organizer Profile</Typography>
        {msg && <Alert severity={msg.includes("updated") ? "success" : "error"} sx={{ mb: 2 }}>{msg}</Alert>}
        <form onSubmit={save}>
          <Stack spacing={2}>
            <TextField name="organizerName" label="Name" value={form.organizerName} onChange={onChange} required />
            <TextField name="organizerCategory" label="Category" value={form.organizerCategory} onChange={onChange} required />
            <TextField name="organizerDescription" label="Description" value={form.organizerDescription} onChange={onChange} multiline minRows={2} />
            <TextField name="contactEmail" label="Contact Email" value={form.contactEmail} onChange={onChange} required />
            <TextField name="contactNumber" label="Contact Number" value={form.contactNumber} onChange={onChange} />
            <TextField name="discordWebhookUrl" label="Discord Webhook URL" value={form.discordWebhookUrl} onChange={onChange} helperText="New events will auto-post to this webhook." />
            <TextField name="photoUrl" label="Photo URL (optional)" value={form.photoUrl} onChange={onChange} />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained">Save</Button>
              <Button variant="outlined" onClick={() => navigate("/organizer/profile")}>Cancel</Button>
            </Stack>
          </Stack>
        </form>
      </Container>
    </>
  );
};

export default UpdateOrganizerProfile;