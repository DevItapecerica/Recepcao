import { useEffect } from "react";
import { useAuth } from "../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/profile/ProfileContext";

const Singout = () => {
  const { Logout } = useAuth();
  const { attImage, attUser, attEmail } = useProfile();
  const Navigate = useNavigate();
  useEffect(() => {
    const signOut = async () => {
      try {
        await Logout();
      } finally {
        attUser(null);
        attImage(null);
        attEmail(null);
        Navigate("/");
      }
    };
    signOut();
  }, []);

  return;
};

export default Singout;
