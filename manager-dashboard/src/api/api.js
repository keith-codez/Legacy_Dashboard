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
  const res = await API.get(`/allocations/?invoice=${id}`);
  return res.data.results || res.data;
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

export const getUnits = async () => {
  const res = await API.get("/units/");
  return res.data.results || res.data;
};
export const getLease = async (id) => {
  const res = await API.get(`/leases/${id}/`);
  return res.data;
};

export const getLeaseDetails = async (id) => {
  const res = await API.get(`/leases/${id}/details/`);
  return res.data;
};

export const createLease = async (payload) => {
  const res = await API.post("/leases/", payload);
  return res.data;
};


export const updateUnit = async (id, payload) => {
  const res = await API.put(`/units/${id}/`, payload);
  return res.data;
};
export const getUnit = async (id) => {
  const res = await API.get(`/units/${id}/`);
  return res.data;
};

export const createUnit = async (data) => {
  const res = await API.post("/units/", data);
  return res.data;
};
export const getInteractions = async () => {
  const res = await API.get("/interactions/");
  return res.data;
};

export const getInteraction = async (id) => {
  const res = await API.get(`/interactions/${id}/`);
  return res.data;
};


export const createInteraction = async (data) => {
  const res = await API.post("/interactions/", data);
  return res.data;
};

export const getReports = async (tenant = "all", period = "") => {
  const params = new URLSearchParams();

  if (tenant && tenant !== "all") params.append("tenant", tenant);
  if (period) params.append("period", period);

  const res = await API.get(`/reports/?${params.toString()}`);
  return res.data;
};

export const getTenantStatement = async (id) => {
  const res = await API.get(`/tenants/${id}/statement/`);
  return res.data;
};


export const exportPortfolio = (period = null) => {
  return API.get("/reports/export/portfolio/", {
    params: period ? { period } : {},
    responseType: "blob",
  });
};

export const exportStatements = (tenant = "all") => {
  return API.get("/reports/export/statements/", {
    params: {
      tenant,
    },
    responseType: "blob",
  });
};

export const getRevenueTrend = async () => {
  const res = await API.get("/reports/revenue-trend/");
  return res.data;
};

export const getOccupancyTrend = async () => {
  const res = await API.get("/reports/occupancy-trend/");
  return res.data;
};

export const getTenantOutstandingBalances = async () => {
  const res = await API.get("/reports/tenant-outstanding-balances/");
  return res.data;
};