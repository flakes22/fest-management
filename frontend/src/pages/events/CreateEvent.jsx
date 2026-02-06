import { useEffect, useState } from "react";
import api from "../../api/api";
import { Container, Typography, Stack, TextField, MenuItem, Button, Card, CardContent, IconButton, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import OrganizerNavbar from "../../components/OrganizerNavbar";

const CreateEvent = () => {
  const { id } = useParams(); // if editing, route: /organizer/events/:id/edit
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: "", description: "", type: "normal", eligibility: "All",
    registrationDeadline: "", startDate: "", endDate: "", registrationLimit: 50, registrationFee: 0, tags: ""
  });
  const [builderLocked, setBuilderLocked] = useState(false);
  const [fields, setFields] = useState([
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "email", label: "Email", type: "text", required: true },
  ]);
  const [status, setStatus] = useState("draft"); // draft | published | ongoing | completed | closed
  const isDraft = status === "draft";
  const isPublished = status === "published";
  const isOngoing = status === "ongoing";
  const isCompleted = status === "completed";
  const isClosed = status === "closed";
  const canEditBasics = isDraft; // free edits
  const canEditLimited = isPublished; // description, extend deadline, increase limit
  const canOnlyStatusChange = isOngoing || isCompleted || isClosed;

  useEffect(() => {
    const load = async () => {
      if (isEdit) {
        const res = await api.get(`/events/${id}`);
        const e = res.data.event;
        setStatus(e.status || "draft");
        setForm({
          name: e.name || "", description: e.description || "", type: e.type || "normal",
          eligibility: e.eligibility || "All", registrationDeadline: e.registrationDeadline?.slice(0,10) || "",
          startDate: e.startDate?.slice(0,10) || "", endDate: e.endDate?.slice(0,10) || "",
          registrationLimit: e.registrationLimit || 50, registrationFee: e.registrationFee || 0, tags: (e.tags || []).join(", ")
        });
        // fallback to event.formFields if /form route is not present
        if (Array.isArray(e.formFields)) setFields(e.formFields.map((f, i) => ({ key: f.label || `field_${i}`, ...f })));
        setBuilderLocked(!!e.formLocked);
      }
    };
    load().catch(() => {});
  }, [id, isEdit]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const addField = () => setFields((fs) => ([...fs, { key: `field_${fs.length+1}`, label: "New Field", type: "text", required: false }]));
  const updateField = (idx, patch) => setFields((fs) => fs.map((f, i) => i === idx ? { ...f, ...patch } : f));
  const moveField = (idx, dir) => setFields((fs) => {
    const next = [...fs]; const swap = idx + dir; if (swap < 0 || swap >= next.length) return fs;
    [next[idx], next[swap]] = [next[swap], next[idx]]; return next;
  });
  const removeField = (idx) => setFields((fs) => fs.filter((_, i) => i !== idx));

  const submitEvent = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      registrationLimit: Number(form.registrationLimit),
      registrationFee: Number(form.registrationFee),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (isEdit) {
      if (canOnlyStatusChange) return alert("Edits are locked. Only status changes allowed.");
      try {
        // In published: allow description, deadline, limit updates
        const patch = canEditLimited && !canEditBasics
          ? {
              description: form.description,
              registrationDeadline: form.registrationDeadline,
              registrationLimit: Number(form.registrationLimit),
            }
          : payload; // draft: full payload
        const res = await api.put(`/events/${id}`, patch);
        setStatus(res.data.event?.status || status);
        alert("Event updated");
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to update event");
      }
      return;
    }

    // Create new event (always draft)
    let newEventId = null;
    try {
      const created = await api.post("/events", { ...payload, status: "draft" });
      newEventId = created?.data?.eventId || created?.data?.event?._id;
      alert("Event created successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create event");
      return;
    }

    if (newEventId) {
      try {
        await api.post(`/events/${newEventId}/form`, { fields, locked: false });
      } catch {}
    }

    // Reset form
    setForm({
      name: "",
      description: "",
      type: "normal",
      eligibility: "All",
      registrationDeadline: "",
      startDate: "",
      endDate: "",
      registrationLimit: 50,
      registrationFee: 0,
      tags: "",
    });
    setFields([
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
    ]);
    setBuilderLocked(false);
    setStatus("draft");
  };

  const saveFormBuilder = async () => {
    if (!id) return alert("Save the event first to configure its form.");
    if (builderLocked) return alert("Form is locked after first registration.");
    try {
      await api.put(`/events/${id}`, { formFields: fields }); // allowed in draft per backend controller
      alert("Form saved");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save form");
    }
  };

  const publish = async () => {
    if (!id) return alert("Save the event first.");
    try {
      await api.post(`/events/${id}/publish`);
      setStatus("published");
      alert("Published");
    } catch {
      alert("Failed to publish");
    }
  };
  const close = async () => {
    try {
      await api.post(`/events/${id}/close`);
      setStatus("closed");
      alert("Closed");
    } catch {
      alert("Failed to close");
    }
  };
  const markOngoing = async () => {
    try {
      await api.post(`/events/${id}/ongoing`);
      setStatus("ongoing");
      alert("Marked ongoing");
    } catch { alert("Failed to mark ongoing"); }
  };
  const markCompleted = async () => {
    try {
      await api.post(`/events/${id}/completed`); // backend path is /completed
      setStatus("completed");
      alert("Marked completed");
    } catch { alert("Failed to mark completed"); }
  };

  // Disable inputs based on status
  const disableAll = canOnlyStatusChange;
  const disableBasic = !canEditBasics && !canEditLimited;
  const disableDescriptionOnly = canEditLimited && !canEditBasics;

  return (
    <>
      <OrganizerNavbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>{isEdit ? "Edit Event" : "Create Event"}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Status: {status}
        </Typography>
        <form onSubmit={submitEvent}>
          <Stack spacing={2}>
            <TextField name="name" label="Name" value={form.name} onChange={onChange} required disabled={!isDraft} />
            <TextField name="description" label="Description" value={form.description} onChange={onChange} multiline minRows={2} disabled={disableAll ? true : false} />
            <TextField select name="type" label="Type" value={form.type} onChange={onChange} disabled={!isDraft}>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="merchandise">Merchandise</MenuItem>
            </TextField>
            <TextField name="eligibility" label="Eligibility" value={form.eligibility} onChange={onChange} disabled={!isDraft} />
            <TextField name="registrationDeadline" label="Registration Deadline" type="date" value={form.registrationDeadline} onChange={onChange} InputLabelProps={{ shrink: true }} required disabled={disableAll ? true : false} />
            <TextField name="startDate" label="Start Date" type="date" value={form.startDate} onChange={onChange} InputLabelProps={{ shrink: true }} required disabled={!isDraft} />
            <TextField name="endDate" label="End Date" type="date" value={form.endDate} onChange={onChange} InputLabelProps={{ shrink: true }} required disabled={!isDraft} />
            <TextField name="registrationLimit" label="Registration Limit" type="number" value={form.registrationLimit} onChange={onChange} disabled={disableAll ? true : false} />
            <TextField name="registrationFee" label="Registration Fee" type="number" value={form.registrationFee} onChange={onChange} disabled={!isDraft} />
            <TextField name="tags" label="Tags (comma-separated)" value={form.tags} onChange={onChange} disabled={!isDraft} />
            <Stack direction="row" spacing={2}>
              {isEdit && isDraft && <Button onClick={publish} variant="contained">Publish</Button>}
              {isEdit && isPublished && (
                <>
                  <Button onClick={close} variant="outlined">Close Registrations</Button>
                  <Button onClick={markOngoing} variant="text">Mark Ongoing</Button>
                </>
              )}
              {isEdit && (isOngoing || isClosed) && (
                <Button onClick={markCompleted} variant="outlined">Mark Completed</Button>
              )}
              <Button type="submit" variant="contained" disabled={canOnlyStatusChange}>
                {isEdit ? "Save" : "Create"}
              </Button>
            </Stack>
          </Stack>
        </form>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Registration Form Builder</Typography>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              {fields.map((f, idx) => (
                <Stack key={f.key} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 20, height: 20, bgcolor: "action.hover", borderRadius: 0.5 }} />
                  <TextField size="small" label="Label" value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} disabled={builderLocked} />
                  <TextField size="small" select label="Type" value={f.type} onChange={(e) => updateField(idx, { type: e.target.value })} sx={{ width: 160 }} disabled={builderLocked}>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="dropdown">Dropdown</MenuItem>
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                    <MenuItem value="file">File Upload</MenuItem>
                  </TextField>
                  <Button size="small" variant="outlined" onClick={() => updateField(idx, { required: !f.required })} disabled={builderLocked}>
                    {f.required ? "Required" : "Optional"}
                  </Button>
                  <IconButton onClick={() => moveField(idx, -1)} disabled={builderLocked}>↑</IconButton>
                  <IconButton onClick={() => moveField(idx, 1)} disabled={builderLocked}>↓</IconButton>
                  <Button size="small" color="error" onClick={() => removeField(idx)} disabled={builderLocked}>Remove</Button>
                </Stack>
              ))}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button onClick={addField} disabled={builderLocked}>Add Field</Button>
                <Button variant="contained" onClick={saveFormBuilder}>Save Form</Button>
              </Stack>
              {builderLocked && <Typography color="text.secondary" sx={{ mt: 1 }}>Form is locked after first registration.</Typography>}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default CreateEvent;