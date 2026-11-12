import { ProfileContext } from "./ProfileContext";
import { useCallback, useMemo, useState } from "react";

const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null)
  const [email, setEmail] = useState(null);

  const attUser = useCallback((user) => setUser(user), []);

  const attImage = useCallback((link) => setImage(link), []);

  const attEmail = useCallback((email) => setEmail(email), []);

  const value = useMemo(
    () => ({ user, attUser, image, attImage, email, attEmail }),
    [user, attUser, image, attImage, email, attEmail],
  );


  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
