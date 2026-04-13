import API from "./client";

export const getTenants = async () => {
  const res = await API.get("/tenants/");
  return res.data.results || res.data;
};
export const fetchTenant = async (id) => {
  const res = await API.get(`/tenants/${id}/`);
  return res.data;
};
export const createTenant = async (data) => {
  const res = await API.post("/tenants/", data);
  return res.data; // CRITICAL
};
export const updateTenant = async (id, data) => {
  const res = await API.put(`/tenants/${id}/`, data);
  return res.data;
};
export const deleteTenant = (id) => API.delete(`/tenants/${id}/`);
export const getTenantDetails = async (id) => {
  const res = await API.get(`/tenants/${id}/details/`);
  return res.data;
};

// Leases
export const getLeases = async () => {
  const res = await API.get("/leases/");
  
  // Handle both paginated and non-paginated responses
  return res.data.results || res.data;
};

export const getDashboard = async () => {
  const res = await API.get("/dashboard/");
  return res.data;
};

export const getPayments = async () => {
  const res = await API.get("/payments/");
  return res.data.results || res.data;
};

// Payments
export const getPayment = async (id) => {
  const res = await API.get(`/payments/${id}/`);
  return res.data;
};

// Allocations
export const getAllocations = async () => {
  const res = await API.get("/allocations/");
  return res.data.results || res.data;
};

// Invoices
export const getInvoices = async () => {
  const res = await API.get("/invoices/");

  const data = res.data;

  // normalize aggressively
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;

  console.warn("Unexpected invoices payload:", data);
  return [];
};


export const getPaymentDetails = async (id) => {
  const res = await API.get(`/payments/${id}/details/`);
  return res.data;
};

export const createPayment = async (payload) => {
  const res = await API.post("/payments/", payload);
  return res.data;
};


export const getOutstandingInvoices = async (tenantId) => {
  const res = await API.get(`/invoices/outstanding/?tenant=${tenantId}`);
  return res.data;
};

export const getInvoiceAllocations = async (id) => {
  const res = await API.get(`/invoices/${id}/allocations/`);
  return res.data;
};

export const getInvoice = async (id) => {
  const res = await API.get(`/invoices/${id}/`);
  return res.data;
};

export const getTenantLeases = async (tenantId) => {
  const res = await API.get(`/leases/?tenant=${tenantId}`);
  return res.data;
};

export const createInvoice = async (payload) => {
  const res = await API.post("/invoices/", payload);
  return res.data;
};