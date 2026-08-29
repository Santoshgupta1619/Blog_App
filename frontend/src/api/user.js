import API from "./axios";

export const getProfile = () =>
  API.get("/users/profile");

export const updateProfile = (data) =>
  API.put("/users/profile", data);

export const updatePassword = (data) =>
  API.put("/users/password", data);


// ======================================================
// WRITER APIs
// ======================================================

// Get writer profile, status, categories and latest request
export const getWriterProfile = () =>
  API.get("/writer/profile");


// Update writer profile
export const updateWriterProfile = (data) =>
  API.put("/writer/profile", data);

// Change writer password
export const changeWriterPassword = (data) =>
  API.put("/writer/password", data);

// Get approved writer categories
export const getWriterCategories = () =>
  API.get("/writer/categories");

// Get articles created by logged-in writer
export const getWriterArticles = () =>
  API.get("/writer/articles");

export const deleteWriterArticle = (id) =>
  API.delete(`/writer/articles/${id}`);

// Submit writer/category request
export const submitWriterRequest = (data) =>
  API.post("/writer/request", data);

export const getWriterRequests = () => {
  return API.get("/writer/admin/requests");
};

export const reviewWriterRequest = (id, data) => {
  return API.put(`/writer/admin/requests/${id}`, data);
};

export const getAvailableCategories = () =>
  API.get("/writer/available-categories");