// src/context/authContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextProps {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const session = await AsyncStorage.getItem("isLoggedIn");
      if (session === "true") {
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    loadSession();
  }, []);

  const login = async () => {
    setIsLoggedIn(true);
    await AsyncStorage.setItem("isLoggedIn", "true");
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await AsyncStorage.removeItem("isLoggedIn");
  };

  if (loading) return null; // Puedes mostrar un splash aquí si deseas

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
