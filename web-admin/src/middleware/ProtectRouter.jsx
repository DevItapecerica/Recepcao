
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfile } from "../context/profile/ProfileContext";
import PrintProtection from "../components/PrintProtection";
import { useAuth } from "../context/auth/AuthContext";
import ErrorMiddleware from "./ErrorMiddleware";
import Loading from "./Loading";


const ProtectRouter = () => {
  const { isAuth, error, isInitializing } = useAuth();
  const { user } = useProfile();
  const { pathname } = useLocation();

  if (error) {
    return <ErrorMiddleware error={error} />;
  }

  if (isInitializing) {
    return <Loading />;
  }

  if (!isAuth) return <Navigate to="/" replace />;

  const viewerPaths = ["/admin", "/admin/visits", "/admin/configurations", "/singout"];
  if (user?.role === "viewer" && !viewerPaths.includes(pathname.replace(/\/+$/, "").toLowerCase())) {
    return <Navigate to="/Admin" replace />;
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)]">
    <PrintProtection />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectRouter;
