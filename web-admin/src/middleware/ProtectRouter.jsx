import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../context/auth/AuthContext";
import { useProfile } from "../context/profile/ProfileContext";

import SideNav from "@/pages/nav/SideNav";
import ErrorMiddleware from "./ErrorMiddleware";
import { validateToken } from "../service/Login";
import { useLoading } from "../context/loading/LoadingContext";

const ProtectRouter = () => {
  const { isAuth, token, error, Logout, isInitializing } = useAuth();
  const { attImage, attUser, user } = useProfile();
  const { loading, attLoading } = useLoading();

  const Navigate = useNavigate();

  const Validate = async () => {
    attLoading(true);
    try {
      const response = await validateToken();
      const { name, role, uuid } = response.user;
      attImage(response.user.image);
      await attUser({ name, role, uuid });
    } catch (error) {
      if (error.response?.status === 401) await Logout();
    } finally {
      attLoading(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return;
    !isAuth || !token ? Navigate("/") : "";
    if (isAuth && token) Validate();
  }, [token, isAuth, isInitializing]);

  if (error) {
    <div className="h-full bg-content m-auto border-b border-gray-200 dark:border-none mb-1 flex md:flex-row flex-col">
      <SideNav />

      <ErrorMiddleware error={error} />
    </div>;
  }

  if (loading || isInitializing) {
    return <></>;
  }

  return (
    <div className="h-full bg-content m-auto border-b border-gray-200 dark:border-none mb-1 flex md:flex-row flex-col">
      <SideNav />
      <div className="p-8 overflow-x-hidden w-full">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default ProtectRouter; // Exporting the component
