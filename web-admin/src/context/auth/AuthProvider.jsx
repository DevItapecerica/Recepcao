import { AuthContext } from "./AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { logoutSession, refreshSession, validateToken } from "../../service/Login";
import { useProfile } from "../profile/ProfileContext";

const isExpired = (token) => {
  if (!token) return true;
  try {
    const payload = token.replace("Bearer ", "").split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(normalized));
    return !exp || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : null
  );
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
    localStorage.setItem("token", token);
    setToken(token);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
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
      let activeToken = localStorage.getItem("token");
      if (isExpired(activeToken)) {
        try {
          activeToken = await refreshSession();
          setToken(activeToken);
        } catch {
          clearSession();
          return;
        }
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
