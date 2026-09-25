import { useState } from "react";
import { AuthContext } from "./authContextValue";
import { loginUser, registerUser } from "../services/authService";

const STORAGE_KEY = "decisiontrace_user";

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const loggedInUser = response.user;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem("decisiontrace_token", response.token);

    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
    localStorage.setItem("decisiontrace_token", response.token);
    setUser(response.user);
    return response.user;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("decisiontrace_token");
    setUser(null);
  };

  // Update user information
  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return null;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const value = {
    user,
    loading: false,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;