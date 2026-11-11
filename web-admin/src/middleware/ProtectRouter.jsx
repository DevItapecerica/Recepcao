
import { Navigate, Outlet } from "react-router-dom";
import PrintProtection from "../components/PrintProtection";
import { useAuth } from "../context/auth/AuthContext";
import ErrorMiddleware from "./ErrorMiddleware";
import Loading from "./Loading";


const ProtectRouter = () => {
  const { isAuth, error, isInitializing } = useAuth();

  if (error) {
    return <ErrorMiddleware error={error} />;
  }

  if (isInitializing) {
    return <Loading />;
  }

  if (!isAuth) return <Navigate to="/" replace />;

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
