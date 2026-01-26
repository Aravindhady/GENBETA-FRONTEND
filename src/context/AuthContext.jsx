import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= exp) {
          // Token expired
          logout();
          window.location.href = "/login";
        }
      } catch (e) {
        // Invalid token format
        logout();
        window.location.href = "/login";
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Periodic token expiration check
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        if (Date.now() >= exp) {
          logout();
          clearInterval(interval);
          toast.error("Your session has expired. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } catch (e) {
        logout();
        clearInterval(interval);
        window.location.href = "/login";
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      updateUser,
      logout,
      isAuthenticated: !!token,
      role: user?.role
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
