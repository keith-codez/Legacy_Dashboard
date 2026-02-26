import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./components/Login";
import Dashboard from "./pages/manager/Dashboard";
import TenantList from "./pages/manager/Tenants";
import Payments from "./pages/manager/Payments";
import Invoices from "./pages/manager/Invoices";
import Leases from "./pages/manager/Leases";
import Units from "./pages/manager/Units";
import Interactions from "./pages/manager/Interactions";
import Reports from "./pages/manager/Reports";
import TenantDetails from "./pages/manager/TenantDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Manager Dashboard */}
        <Route path="/manager" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tenants" element={<TenantList />} />
          <Route path="tenants/:id" element={<TenantDetails />} />
          <Route path="payments" element={<Payments />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="leases" element={<Leases />} />
          <Route path="units" element={<Units />} />
          <Route path="interactions" element={<Interactions />} />
          <Route path="reports" element={<Reports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}