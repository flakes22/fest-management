import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, TextField, Button, Alert } from "@mui/material";
import ParticipantNavbar from "../../components/ParticipantNavbar";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", contactNumber: "", college: "",
    interestsInput: "", photoUrl: ""
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    const res = await api.get("/profile/me");
    const p = res.data.profile || {};
    setForm({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      contactNumber: p.contactNumber || "",
      college: p.college || "",
      interestsInput: (p.interests || []).join(", "),
      photoUrl: p.photoUrl || ""
    });
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const onChange = (e) => setMsg("") || setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      const interests = form.interestsInput.split(",").map((s) => s.trim()).filter(Boolean);
      // Backend currently allows: firstName, lastName, contactNumber, college, interests
      // photoUrl is optional; ignore if backend doesn’t support yet
      await api.put("/profile/me", {
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        college: form.college,
        interests
      });
      setMsg("Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 600);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Update Profile</Typography>
        {msg && <Alert severity={msg.includes("success") ? "success" : "error"} sx={{ mb: 2 }}>{msg}</Alert>}
        <form onSubmit={save}>
          <Stack spacing={2}>
            <TextField name="firstName" label="First Name" value={form.firstName} onChange={onChange} required />
            <TextField name="lastName" label="Last Name" value={form.lastName} onChange={onChange} required />
            <TextField name="contactNumber" label="Contact Number" value={form.contactNumber} onChange={onChange} />
            <TextField name="college" label="College/Organization" value={form.college} onChange={onChange} />
            <TextField
              name="interestsInput"
              label="Selected Interests (comma-separated)"
              value={form.interestsInput}
              onChange={onChange}
            />
            {/* Optional: photo URL field for future backend support */}
            <TextField
              name="photoUrl"
              label="Photo URL (optional)"
              value={form.photoUrl}
              onChange={onChange}
              helperText="Provide a public image URL. If omitted, a placeholder initial is shown."
            />
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Button type="submit" variant="contained">Save</Button>
              <Button variant="outlined" onClick={() => navigate("/profile")}>Cancel</Button>
            </Stack>
          </Stack>
        </form>
      </Container>
    </>
  );
};

export default UpdateProfile;