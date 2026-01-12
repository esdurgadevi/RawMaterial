import React from "react";
import { Navigate } from "react-router-dom";

// ================= AUTH PAGES =================
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// ================= ADMIN LAYOUT =================
import AdminLayout from "./layouts/AdminLayout.jsx";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import State from "./pages/admin/State.jsx";
import Station from "./pages/admin/Station.jsx";
import Supplier from "./pages/admin/Supplier.jsx";
import MixingGroup from "./pages/admin/MixingGroup.jsx";
import MixingGroupRoutes from "./pages/admin/MixingGroupRoutes.jsx";
import Fibre from "./pages/admin/Fibre.jsx";
import Variety from "./pages/admin/Variety.jsx";
import Godown from "./pages/admin/Godown.jsx";
import CompanyBroker from "./pages/admin/CompanyBroker.jsx";
import WCSales from "./pages/admin/WcSales.jsx";
import Commodity from "./pages/admin/Commodity.jsx";
import Transport from "./pages/admin/Transport.jsx";
import PackingType from "./pages/admin/PackingType.jsx";
import Waste from "./pages/admin/Waste.jsx";
import WasteRates from "./pages/admin/WasteRate.jsx";
import WasteLot from "./pages/admin/WasteLot.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Broker from "./pages/admin/Broker.jsx";
import Cost from "./pages/admin/Cost.jsx"
import PurchaseOrderManagement from "./pages/admin/PurchaseOrderManagement.jsx";
import InwardEntryManagement from "./pages/admin/InwardEntryManagement.jsx";
// ================= PROTECTED ROUTE =================
const ProtectedRoute = ({ children, role }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ================= ROUTES =================
const routes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },

      { path: "state", element: <State /> },
      { path: "station", element: <Station /> },
      { path: "supplier", element: <Supplier /> },
      { path: "broker", element:<Broker />},
      { path: "mixing_group", element: <MixingGroup /> },
      { path: "mixing_group_routes", element: <MixingGroupRoutes /> },

      { path: "fibre", element: <Fibre /> },
      { path: "variety", element: <Variety /> },

      { path: "godown", element: <Godown /> },
      { path: "company-broker", element: <CompanyBroker /> },

      { path: "wc-sales", element: <WCSales /> },

      { path: "commodity", element: <Commodity /> },
      { path: "transport", element: <Transport /> },
      { path: "packing-type", element: <PackingType /> },

      { path: "waste", element: <Waste /> },
      { path: "waste-rates", element: <WasteRates /> },
      { path: "waste-lot", element: <WasteLot /> },
      { path: "cost-master",element:<Cost />},
      { path:"purchase-order",element:<PurchaseOrderManagement />},
      { path: "reports", element: <Reports /> },
      { path:"inward-entries", element:<InwardEntryManagement />}
    ],
  },
];

export default routes;
