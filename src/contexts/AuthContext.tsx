import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any;
  login: (data: any) => Promise<void>;
  logout: () => void;
  signup: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const login = async (data: any) => {
    // Implement login logic
    setUser(data);
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  const signup = async (data: any) => {
    // Implement signup logic
    setUser(data);
    navigate("/dashboard");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
