import API from "./axios";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return API.post("/upload", formData);
};