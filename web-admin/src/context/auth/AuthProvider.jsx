import { AuthContext } from "./AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { logoutSession, refreshSession, validateToken } from "../../service/Login";
import { useProfile } from "../profile/ProfileContext";
import { setAccessToken } from "../../API/API";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("initializing");
  const [error, setError] = useState(null);
  const initializationStarted = useRef(false);
  const { attImage, attUser, attEmail } = useProfile();

  const attError = (error) => {
    const message =
      error.response?.data?.message || error.message || "Erro desconhecido";
    const code = error.response?.status || error.status || 500;

    setError({ message: message, code: code });
  };

  const Login = useCallback((token) => {
    setAccessToken(token);
    setToken(token);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setStatus("anonymous");
    attUser(null);
    attImage(null);
    attEmail(null);
  }, [attEmail, attImage, attUser]);

  const Logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    const handleRefreshedToken = ({ detail }) => setToken(detail);
    const handleExpiredSession = () => clearSession();
    window.addEventListener("auth:token-refreshed", handleRefreshedToken);
    window.addEventListener("auth:session-expired", handleExpiredSession);
    return () => {
      window.removeEventListener("auth:token-refreshed", handleRefreshedToken);
      window.removeEventListener("auth:session-expired", handleExpiredSession);
    };
  }, [clearSession]);

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const initialize = async () => {
      let activeToken;
      try {
        activeToken = await refreshSession();
        setToken(activeToken);
      } catch {
        clearSession();
        return;
      }

      try {
        const response = await validateToken(activeToken);
        attUser(response.user);
        attImage(response.user.image || null);
        setStatus("authenticated");
      } catch {
        clearSession();
      }
    };

    initialize();
  }, [attImage, attUser, clearSession]);

  const isAuth = status === "authenticated";
  const isInitializing = status === "initializing";

  return (
    <AuthContext.Provider
      value={{ token, Login, Logout, error, attError, isAuth, isInitializing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
