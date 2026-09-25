import api from "./api";

/*
  Register a new user
*/
export async function registerUser(userData) {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
}

/*
  Login user
*/
export async function loginUser(credentials) {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  return response.data;
}

/*
  Get currently logged-in user
*/
export async function getCurrentUser() {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
}

/*
  Logout user
*/
export async function logoutUser() {
  const response = await api.post(
    "/auth/logout"
  );

  return response.data;
}

/*
  Forgot password
*/
export async function forgotPassword(email) {
  const response = await api.post(
    "/auth/forgot-password",
    { email }
  );

  return response.data;
}

/*
  Reset password
*/
export async function resetPassword(
  token,
  password
) {
  const response = await api.post(
    `/auth/reset-password/${token}`,
    { password }
  );

  return response.data;
}

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
};