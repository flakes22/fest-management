import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // fixed path (was ../api)

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Optionally check preferences and redirect
      const role = localStorage.getItem("role");
      if (role === "participant") {
        try {
          const res = await api.get("/profile/preferences");
          const hasPrefs = (res.data.interests?.length || 0) > 0 || (res.data.followedOrganizers?.length || 0) > 0;
          navigate(hasPrefs ? "/dashboard" : "/onboarding/preferences");
        } catch {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
