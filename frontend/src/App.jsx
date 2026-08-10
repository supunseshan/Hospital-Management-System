import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ResourcePage from "./pages/ResourcePage";
import {
  patientsConfig,
  doctorsConfig,
  departmentsConfig,
  appointmentsConfig,
  admissionsConfig,
  medicalRecordsConfig,
} from "./pages/resourceConfigs.jsx";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Laboratory from "./pages/Laboratory";
import Pharmacy from "./pages/Pharmacy";
import Billing from "./pages/Billing";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

function NoAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-xl font-semibold mb-2">No profile found</h1>
        <p className="text-slate-600">
          Ask an administrator to set up your account, or check the browser console for errors.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-access" element={<NoAccess />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <ResourcePage config={patientsConfig} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors"
            element={
              <ProtectedRoute>
                <ResourcePage config={doctorsConfig} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <ResourcePage config={departmentsConfig} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <ResourcePage config={appointmentsConfig} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admissions"
            element={
              <ProtectedRoute roles={["admin", "doctor", "nurse", "receptionist"]}>
                <ResourcePage config={admissionsConfig} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-records"
            element={
              <ProtectedRoute roles={["admin", "doctor", "nurse"]}>
                <ResourcePage config={medicalRecordsConfig} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/laboratory"
            element={
              <ProtectedRoute roles={["admin", "doctor", "nurse", "lab_staff"]}>
                <Laboratory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute roles={["admin", "pharmacist", "doctor", "nurse"]}>
                <Pharmacy />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute roles={["admin", "accountant", "receptionist"]}>
                <Billing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}