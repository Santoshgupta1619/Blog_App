import API from "./axios";

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const forgotPassword = (data) =>
  API.post("/auth/forgot-password", data);

export const verifyOTP = (data) =>
  API.post("/auth/verify-otp", data);

export const resetPassword = (data) =>
  API.post("/auth/reset-password", data);