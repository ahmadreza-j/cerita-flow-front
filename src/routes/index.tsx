import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Components
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import ClinicManagerLayout from "../components/layout/ClinicManagerLayout";
import SecretaryLayout from "../components/layout/SecretaryLayout";
import DoctorLayout from "../components/layout/DoctorLayout";
import OpticianLayout from "../components/layout/OpticianLayout";

// Admin Pages
import UserManagement from "../pages/admin/UserManagement";

// Secretary Pages
import SecretaryDashboard from "../pages/secretary/SecretaryDashboard";

// Doctor Pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";

// Optician Pages
import ProductManagement from "../pages/optician/ProductManagement";
import SalesManagement from "../pages/optician/SalesManagement";
import OpticianDashboard from "../pages/optician/OpticianDashboard";

import ProtectedRoute from "./ProtectedRoute";
import { Role } from "../types/auth";

const AppRoutes: React.FC = () => {
  const router = useRouter();
  const { pathname } = router;

  // Helper function to render protected route
  const renderProtectedRoute = (Component: React.ComponentType, allowedRoles: Role[], Layout: React.ComponentType<any>) => {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout>
          <Component />
        </Layout>
      </ProtectedRoute>
    );
  };

  // Render appropriate component based on current path
  switch (pathname) {
    case '/':
      return <Home />;
    case '/login':
      return <Login />;
    case '/register':
      return <Register />;
    case '/admin':
    case '/admin/users':
      return renderProtectedRoute(UserManagement, [Role.ADMIN], AdminLayout);
    case '/clinic-manager':
      return renderProtectedRoute(() => <div>Dashboard</div>, [Role.CLINIC_MANAGER], ClinicManagerLayout);
    case '/secretary':
      return renderProtectedRoute(SecretaryDashboard, [Role.SECRETARY], SecretaryLayout);
    case '/doctor':
      return renderProtectedRoute(DoctorDashboard, [Role.DOCTOR], DoctorLayout);
    case '/optician':
      return renderProtectedRoute(OpticianDashboard, [Role.OPTICIAN], OpticianLayout);
    case '/optician/products':
      return renderProtectedRoute(ProductManagement, [Role.OPTICIAN], OpticianLayout);
    case '/optician/sales':
      return renderProtectedRoute(SalesManagement, [Role.OPTICIAN], OpticianLayout);
    default:
      router.push('/login');
      return null;
  }
};

export default AppRoutes;
