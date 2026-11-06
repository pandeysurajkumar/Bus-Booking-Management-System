
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import {
  loginUser,
  registerUser,
  refreshSession,
  logoutUser
} from "../features/auth/authService";

import { setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialized = useRef(false);

  // Restore an existing session when the application starts.
  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    const initializeAuth = async () => {
      try {
        const result = await refreshSession();

        setAccessToken(result.accessToken);
        setUser(result.user);

      } catch {
        setAccessToken(null);
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const result = await loginUser(credentials);

    setAccessToken(result.accessToken);
    setUser(result.user);

    return result;
  };

  const register = async (userData) => {
    const result = await registerUser(userData);

    setAccessToken(result.accessToken);
    setUser(result.user);

    return result;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
