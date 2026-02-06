import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { Container, Typography, Stack, Card, CardContent, Button, Alert, TextField, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import ParticipantNavbar from "../../components/ParticipantNavbar";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [fields, setFields] = useState([]); // organizer-defined form fields

  const load = async () => {
    setMsg("");
    const res = await api.get(`/events/${id}`);
    const e = res.data.event;
    setEvent(e);
    // try to fetch form fields from dedicated endpoint, else fallback to event.formFields
    let ff = [];
    try {
      const fRes = await api.get(`/events/${id}/form`);
      ff = Array.isArray(fRes.data.fields) ? fRes.data.fields : [];
    } catch {
      ff = Array.isArray(e.formFields) ? e.formFields : [];
    }
    setFields(ff);

    // initialize formData keys based on fields
    const init = {};
    ff.forEach((f) => {
      const key = f.label || f.key || f.name;
      if (!key) return;
      if (f.type === "checkbox") init[key] = false;
      else init[key] = "";
    });
    setFormData(init);

    setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, [id]);

  useEffect(() => {
    api.get(`/events/${id}`).then((res) => {
      const e = res.data.event;
      if (!["published", "ongoing"].includes(e.status)) {
        setError("Event not available to participants");
      } else {
        setEvent(e);
      }
    }).catch(() => setError("Failed to load"));
  }, [id]);

  const disabledReason = () => {
    if (!event) return "";
    const now = new Date();
    const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
    if (deadline && now > deadline) return "Registration deadline has passed.";
    if (!["published", "ongoing"].includes(event.status)) return "Event not open for registration.";
    return "";
  };

  const updateField = (label, value) => {
    setFormData((d) => ({ ...d, [label]: value }));
  };

  const registerNormal = async () => {
    try {
      await api.post(`/registrations/normal/${id}`, { formData });
      setMsg("Registration submitted successfully.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Registration failed");
    }
  };

  const purchaseMerch = async () => {
    try {
      await api.post(`/registrations/merch/${id}`, { itemIndex: 0, quantity: 1 });
      setMsg("Purchase successful. Ticket with QR emailed and added to your history.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Purchase failed");
    }
  };

  if (loading) return <Container sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;
  if (!event) return <Container sx={{ py: 4 }}><Typography>Not found</Typography></Container>;

  const reason = disabledReason();

  return (
    <>
      <ParticipantNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>{event.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Type: {event.type} • Organizer: {event.organizer?.organizerName} • {new Date(event.startDate).toLocaleString()} → {new Date(event.endDate).toLocaleString()}
        </Typography>
        <Typography sx={{ mb: 3 }}>{event.description || "No description provided."}</Typography>
        {msg && <Alert severity={msg.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>{msg}</Alert>}

        {/* Dynamic registration form */}
        {event.type === "normal" && fields.length > 0 && (
          <Card sx={{ mt: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Registration Form</Typography>
              <Stack spacing={2}>
                {fields.map((f, idx) => {
                  const label = f.label || f.key || f.name || `Field ${idx + 1}`;
                  const required = !!f.required;
                  const type = f.type || "text";
                  const val = formData[label];

                  if (type === "dropdown") {
                    const options = Array.isArray(f.options) ? f.options : [];
                    return (
                      <TextField
                        key={idx}
                        select
                        label={label}
                        value={val || ""}
                        onChange={(e) => updateField(label, e.target.value)}
                        required={required}
                      >
                        {options.map((opt, i) => (
                          <MenuItem key={`${label}-${i}`} value={opt}>{opt}</MenuItem>
                        ))}
                      </TextField>
                    );
                  }

                  if (type === "checkbox") {
                    return (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            checked={!!val}
                            onChange={(e) => updateField(label, e.target.checked)}
                          />
                        }
                        label={label + (required ? " *" : "")}
                      />
                    );
                  }

                  if (type === "file") {
                    return (
                      <Stack key={idx} spacing={1}>
                        <Typography variant="body2">{label}{required ? " *" : ""}</Typography>
                        <input
                          type="file"
                          onChange={(e) => updateField(label, e.target.files?.[0]?.name || "")}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Note: Actual upload needs a backend file upload API.
                        </Typography>
                      </Stack>
                    );
                  }

                  return (
                    <TextField
                      key={idx}
                      label={label}
                      value={val || ""}
                      onChange={(e) => updateField(label, e.target.value)}
                      required={required}
                      multiline={type === "textarea"}
                      minRows={type === "textarea" ? 3 : undefined}
                    />
                  );
                })}
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={registerNormal} disabled={!!reason}>Submit Registration</Button>
                  {reason && <Typography color="error">{reason}</Typography>}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}

        {event.type === "normal" && fields.length === 0 && (
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Registration form not configured by organizer yet.
          </Typography>
        )}
      </Container>
    </>
  );
};

export default EventDetail;