import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import ClinicManagerLayout from "../components/layout/ClinicManagerLayout";
import SecretaryLayout from "../components/layout/SecretaryLayout";
import DoctorLayout from "../components/layout/DoctorLayout";
import OpticianLayout from "../components/layout/OpticianLayout";

// Admin Pages
import UserManagement from "../pages/admin/UserManagement";
// import ClinicManagement from '../pages/admin/ClinicManagement';

// Clinic Manager Pages
// import ClinicDashboard from '../pages/clinic-manager/Dashboard';
// import StaffManagement from '../pages/clinic-manager/StaffManagement';

// Secretary Pages
// import AppointmentManagement from '../pages/secretary/AppointmentManagement';
// import PatientManagement from '../pages/secretary/PatientManagement';
import SecretaryDashboard from "../pages/secretary/SecretaryDashboard";

// Doctor Pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
// import PatientExamination from '../pages/doctor/PatientExamination';
// import PrescriptionManagement from '../pages/doctor/PrescriptionManagement';

// Optician Pages
import ProductManagement from "../pages/optician/ProductManagement";
import SalesManagement from "../pages/optician/SalesManagement";
import OpticianDashboard from "../pages/optician/OpticianDashboard";

import ProtectedRoute from "./ProtectedRoute";
import { Role } from "../types/auth";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<UserManagement />} />
        <Route path="users" element={<UserManagement />} />
        {/* <Route path="clinics" element={<ClinicManagement />} /> */}
      </Route>

      {/* Clinic Manager Routes */}
      <Route
        path="/clinic-manager"
        element={
          <ProtectedRoute allowedRoles={[Role.CLINIC_MANAGER]}>
            <ClinicManagerLayout>
              <Outlet />
            </ClinicManagerLayout>
          </ProtectedRoute>
        }
      >
        {/* <Route index element={<ClinicDashboard />} />
        <Route path="staff" element={<StaffManagement />} /> */}
      </Route>

      {/* Secretary Routes */}
      <Route
        path="/secretary"
        element={
          <ProtectedRoute allowedRoles={[Role.SECRETARY]}>
            <SecretaryLayout>
              <Outlet />
            </SecretaryLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<SecretaryDashboard />} />
        {/* <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="patients" element={<PatientManagement />} /> */}
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
            <DoctorLayout>
              <Outlet />
            </DoctorLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        {/* <Route path="examination/:patientId" element={<PatientExamination />} />
        <Route path="prescriptions" element={<PrescriptionManagement />} /> */}
      </Route>

      {/* Optician Routes */}
      <Route
        path="/optician"
        element={
          <ProtectedRoute allowedRoles={[Role.OPTICIAN]}>
            <OpticianLayout>
              <Outlet />
            </OpticianLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<OpticianDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="sales" element={<SalesManagement />} />
      </Route>

      {/* Default redirect based on user role */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
