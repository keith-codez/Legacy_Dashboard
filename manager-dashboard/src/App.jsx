import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./components/Login";
import Dashboard from "./pages/manager/Dashboard";
import TenantList from "./pages/manager/Tenants";
import Invoices from "./pages/manager/Invoices";
import LeaseList from "./pages/manager/Leases";
import Units from "./pages/manager/UnitsList";
import Reports from "./pages/manager/Reports";
import TenantDetails from "./pages/manager/TenantDetails";
import EditTenant from "./pages/manager/EditTenant";
import CreateTenant from "./pages/manager/CreateTenant";
import PaymentsList from "./pages/manager/Payments";
import AddPayment from "./pages/manager/AddPayment";  
import InvoiceDetail from "./pages/manager/InvoiceDetail";
import TenantStatement from "./pages/manager/TenantStatement";  
import GenerateInvoice from "./pages/manager/GenerateInvoice";
import PaymentDetail from "./pages/manager/PaymentDetails"; 
import InteractionsList from "./pages/InteractionsList";
import InteractionDetail from "./pages/manager/InteractionDetail";  
import RecordInteraction from "./pages/manager/RecordInteraction";
import UnitsList from "./pages/manager/UnitsList";
import RecordUnit from "./pages/manager/RecordUnit";
import UnitDetail from "./pages/manager/UnitDetail";
import EditUnit from "./pages/manager/EditUnit";
import LeaseDetail from "./pages/manager/LeaseDetail";


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
          <Route path="tenants/new" element={<CreateTenant />} />
          <Route path="tenants/:id/edit" element={<EditTenant />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="payments/:id" element={<PaymentDetail />} />
          <Route path="payments/new" element={<AddPayment />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="invoices/new" element={<GenerateInvoice />} />
          <Route path="leases" element={<LeaseList />} />
          <Route path="leases/:id" element={<LeaseDetail />} />
          <Route path="units" element={<UnitsList />} />
          <Route path="units/new" element={<RecordUnit />} />
          <Route path="units/:id" element={<UnitDetail />} />
          <Route path="units/:id/edit" element={<EditUnit />} />
          <Route path="interactions/new" element={<RecordInteraction />} />
          <Route path="interactions" element={<InteractionsList />} />
          <Route path="interactions/:id" element={<InteractionDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="/manager/statements/:id" element={<TenantStatement />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}