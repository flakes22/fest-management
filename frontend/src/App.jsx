import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/protectedRoute";
import Signup from "./pages/Signup";
import AdminCreateOrganizer from "./pages/AdminCreateOrganizer";
import RoleRoute from "./routes/roleRoute";
import Home from "./pages/Home";
import EventList from "./pages/events/EventList";
import EventDetail from "./pages/events/EventDetail";
import CreateEvent from "./pages/events/CreateEvent";
import Preferences from "./pages/profile/Preferences";
import Profile from "./pages/profile/Profile";
import ChangePassword from "./pages/profile/ChangePassword";
import OnboardingPreferences from "./pages/profile/OnboardingPreferences";
import OrganizerList from "./pages/organizers/OrganizerList";
import OrganizerDetail from "./pages/organizers/OrganizerDetail";
import UpdateProfile from "./pages/profile/UpdateProfile";
import OrganizerEventDetail from "./pages/events/OrganizerEventDetail";
import OrganizerProfile from "./pages/organizers/OrganizerProfile";
import OngoingEvents from "./pages/events/OngoingEvents";
import UpdateOrganizerProfile from "./pages/organizers/UpdateOrganizerProfile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Public browsing */}
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/organizers" element={<OrganizerList />} />
          <Route path="/organizers/:id" element={<OrganizerDetail />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin-only */}
          <Route
            path="/admin/organizers/new"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <AdminCreateOrganizer />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Organizer-only: create event */}
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["organizer", "admin"]}>
                  <CreateEvent />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["organizer", "admin"]}>
                  <OrganizerEventDetail />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["organizer", "admin"]}>
                  <CreateEvent />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/profile"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["organizer", "admin"]}>
                  <OrganizerProfile />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/ongoing"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["organizer", "admin"]}>
                  <OngoingEvents />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/profile/update"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["organizer", "admin"]}>
                  <UpdateOrganizerProfile />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Profile and preferences (participants) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/preferences"
            element={
              <ProtectedRoute>
                <OnboardingPreferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/update"
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            }
          />

          {/* Role-routed main dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
