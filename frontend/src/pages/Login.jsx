import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api/api";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      const role = localStorage.getItem("role");
      if (role === "participant") {
        try {
          const res = await api.get("/profile/preferences");
          const hasPrefs =
            (res.data.interests?.length || 0) > 0 ||
            (res.data.followedOrganizers?.length || 0) > 0;
          navigate(hasPrefs ? "/dashboard" : "/preferences");
        } catch {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg("Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: (theme) =>
          theme.palette.mode === "light" ? "grey.100" : "background.default",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            backdropFilter: "blur(4px)",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue to your dashboard
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {errorMsg && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errorMsg}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.2, fontWeight: 600 }}
              disabled={submitting}
            >
              {submitting ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  Signing in...
                </Box>
              ) : (
                "Login"
              )}
            </Button>

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                Don’t have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/signup"
                  underline="hover"
                  sx={{ fontWeight: 600 }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
