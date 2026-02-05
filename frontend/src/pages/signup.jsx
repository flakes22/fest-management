import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Signup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    participantType: "Non-IIIT",
    college: "",
    contactNumber: "",
    interests: "",
  });
  const navigate = useNavigate();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const interestsArr = form.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        participantType: form.participantType, // "IIIT" | "Non-IIIT"
        college: form.college || undefined,
        contactNumber: form.contactNumber || undefined,
        interests: interestsArr,
      });

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed";
      alert(msg);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: "2rem auto", display: "grid", gap: 12 }}>
      <h2>Participant Signup</h2>
      <input name="firstName" placeholder="First Name" value={form.firstName} onChange={onChange} required />
      <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={onChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
      <div style={{ textAlign: "left" }}>
        <label>
          <input
            type="radio"
            name="participantType"
            value="IIIT"
            checked={form.participantType === "IIIT"}
            onChange={onChange}
          />{" "}
          IIIT
        </label>{" "}
        <label>
          <input
            type="radio"
            name="participantType"
            value="Non-IIIT"
            checked={form.participantType === "Non-IIIT"}
            onChange={onChange}
          />{" "}
          Non-IIIT
        </label>
      </div>
      <input name="college" placeholder="College (optional)" value={form.college} onChange={onChange} />
      <input name="contactNumber" placeholder="Contact Number (optional)" value={form.contactNumber} onChange={onChange} />
      <input
        name="interests"
        placeholder="Interests (comma-separated, e.g. robotics, workshop)"
        value={form.interests}
        onChange={onChange}
      />
      {form.participantType === "IIIT" && (
        <small>Use your IIIT email (iiit.ac.in or students.iiit.ac.in)</small>
      )}
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;