import API from "./client";

export const login = (data) => API.post("/auth/login/", data);

export const logout = () => API.post("/auth/logout/");

export const refresh = () => API.post("/auth/refresh/");