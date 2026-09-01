import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../context/auth/AuthContext";
import { useProfile } from "../context/profile/ProfileContext";

import SideNav from "@/pages/nav/SideNav";
import ErrorMiddleware from "./ErrorMiddleware";
import { validateToken } from "../service/Login";
import { useLoading } from "../context/loading/LoadingContext";

const ProtectRouter = () => {
  const { isAuth, token, error, Logout } = useAuth();
  const { attImage, attUser, user } = useProfile();
  const { loading, attLoading } = useLoading();

  const Navigate = useNavigate();

  const Validate = async () => {
    attLoading(true);
    try {
      const response = await validateToken();
      console.log(response)
      const { name, role, uuid } = response.user;
      attImage(response.user.image);
      await attUser({ name, role, uuid });
    } catch (error) {
      if (error.status == 401) Logout();
    } finally {
      attLoading(false);
    }
  };

  useEffect(() => {
    !isAuth || !token ? Navigate("/") : "";
    Validate();
  }, [token, isAuth]);

  if (error) {
    <div className="h-full bg-content m-auto border-b border-gray-200 dark:border-none mb-1 flex md:flex-row flex-col">
      <SideNav />

      <ErrorMiddleware error={error} />
    </div>;
  }

  if (loading) {
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
