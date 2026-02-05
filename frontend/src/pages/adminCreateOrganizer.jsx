import { useState } from "react";
import api from "../api/api";

const AdminCreateOrganizer = () => {
  const [form, setForm] = useState({
    organizerName: "",
    organizerCategory: "",
    organizerDescription: "",
    organizerContactEmail: "",
    loginEmail: "",
    password: "",
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/organizers", form);
      alert("Organizer created");
      setForm({
        organizerName: "",
        organizerCategory: "",
        organizerDescription: "",
        organizerContactEmail: "",
        loginEmail: "",
        password: "",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create organizer";
      alert(msg);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 520, margin: "2rem auto", display: "grid", gap: 12 }}>
      <h2>Admin: Create Organizer</h2>
      <input name="organizerName" placeholder="Organizer/Club Name" value={form.organizerName} onChange={onChange} required />
      <input name="organizerCategory" placeholder="Category (Club/Council/Fest Team)" value={form.organizerCategory} onChange={onChange} />
      <input name="organizerDescription" placeholder="Description" value={form.organizerDescription} onChange={onChange} />
      <input name="organizerContactEmail" placeholder="Organizer Contact Email" value={form.organizerContactEmail} onChange={onChange} />
      <hr />
      <input name="loginEmail" placeholder="Login Email for Organizer" value={form.loginEmail} onChange={onChange} required />
      <input name="password" type="password" placeholder="Temp Password" value={form.password} onChange={onChange} required />
      <button type="submit">Create Organizer</button>
      <small>Requires admin login (Authorization header is added automatically if you are logged in as admin).</small>
    </form>
  );
};

export default AdminCreateOrganizer;