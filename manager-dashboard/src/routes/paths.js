export const ROUTES = {
  owner: {
    tenants: "/owner/tenants",
    tenantDetails: (id) => `/owner/tenants/${id}`,
  },

  manager: {
    tenants: "/manager/tenants",
    tenantDetails: (id) => `/manager/tenants/${id}`,
  },
};