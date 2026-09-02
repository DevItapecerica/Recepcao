import { useEffect } from "react";
import { useAuth } from "../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Singout = () => {
  const { Logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const signOut = async () => {
      await Logout();
      navigate("/", { replace: true });
    };
    signOut();
  }, [Logout, navigate]);

  return null;
};

export default Singout;
