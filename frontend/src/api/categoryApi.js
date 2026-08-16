import API from "./axios";

export const getCategories = () => {
  return API.get("/categories");
};

export const createCategory = (name) => {
  return API.post("/categories", { name });
};

export const deleteCategory = (id) => {
  return API.delete(`/categories/${id}`);
};