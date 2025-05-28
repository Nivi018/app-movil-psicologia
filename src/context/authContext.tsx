import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextProps {
  isLoggedIn: boolean;
  userRole: string | null;
  login: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  userRole: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const session = await AsyncStorage.getItem("isLoggedIn");
      const role = await AsyncStorage.getItem("userRole");
      if (session === "true") {
        setIsLoggedIn(true);
        if (role) setUserRole(role);
      }
      setLoading(false);
    };

    loadSession();
  }, []);

  const login = async (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    await AsyncStorage.setItem("isLoggedIn", "true");
    await AsyncStorage.setItem("userRole", role);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserRole(null);
    await AsyncStorage.multiRemove(["isLoggedIn", "userRole"]);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
