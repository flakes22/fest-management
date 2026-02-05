import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./routes/protectedRoute";
import Signup from "./pages/signup";
import AdminCreateOrganizer from "./pages/adminCreateOrganizer";
import RoleRoute from "./routes/roleRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Admin-only page to provision organizers */}
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
