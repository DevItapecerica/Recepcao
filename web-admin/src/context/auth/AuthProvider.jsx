import { AuthContext } from "./AuthContext";
import { useEffect, useRef, useState } from "react";
import { logoutSession, refreshSession } from "../../service/Login";

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

const ProfileProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : null
  );
  const [isAuth, setIsAuth] = useState(token ? true : false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const initializationStarted = useRef(false);

  const attError = (error) => {
    const message =
      error.response.data.message || error.message || "Unknow Error";
    const code = error.status || 500;

    setError({ message: message, code: code });
  };

  const Login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
    setIsAuth(true);
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuth(false);
  };

  const Logout = async () => {
    try {
      await logoutSession();
    } finally {
      clearSession();
    }
  };

  useEffect(() => {
    setIsAuth(token ? true : false);
  }, [token]);

  useEffect(() => {
    const handleRefreshedToken = ({ detail }) => setToken(detail);
    const handleExpiredSession = () => clearSession();
    window.addEventListener("auth:token-refreshed", handleRefreshedToken);
    window.addEventListener("auth:session-expired", handleExpiredSession);
    return () => {
      window.removeEventListener("auth:token-refreshed", handleRefreshedToken);
      window.removeEventListener("auth:session-expired", handleExpiredSession);
    };
  }, []);

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const initialize = async () => {
      if (isExpired(localStorage.getItem("token"))) {
        try {
          const refreshedToken = await refreshSession();
          setToken(refreshedToken);
        } catch {
          clearSession();
        }
      }
      setIsInitializing(false);
    };

    initialize();
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, Login, Logout, error, attError, isAuth, isInitializing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default ProfileProvider;
