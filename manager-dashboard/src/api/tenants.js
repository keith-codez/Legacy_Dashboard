import API from "./client";

export const getTenants = async () => {
  const res = await API.get("/tenants/");
  
  // Handle both paginated and non-paginated responses
  return res.data.results || res.data;
};
export const fetchTenant = (id) => API.get(`/tenants/${id}/`);
export const createTenant = (data) => API.post("/tenants/", data);
export const updateTenant = (id, data) => API.put(`/tenants/${id}/`, data);
export const deleteTenant = (id) => API.delete(`/tenants/${id}/`);