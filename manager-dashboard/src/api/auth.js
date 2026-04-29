import API from "./client";

export const login = (data) => API.post("/auth/login/", data);

export const logout = async () => {
  await API.post("/auth/logout/");
  window.location.href = "/";
};

export const refresh = () => API.post("/auth/refresh/");