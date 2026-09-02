import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext";
import SideNav from "@/pages/nav/SideNav";
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
    <div className="h-full bg-content m-auto border-b border-gray-200 dark:border-none mb-1 flex md:flex-row flex-col">
      <SideNav />
      <div className="p-8 overflow-x-hidden w-full">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default ProtectRouter;
