import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import Stack from "@mui/material/Stack";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Felicity!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Welcome! Please login or sign up to continue.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3, flexWrap: "wrap" }}>
            <Button variant="contained" color="primary" component={RouterLink} to="/login">
              Login
            </Button>
            <Button variant="outlined" color="primary" component={RouterLink} to="/signup">
              Sign Up
            </Button>
            <Button variant="text" component={RouterLink} to="/events">
              Browse Events
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;