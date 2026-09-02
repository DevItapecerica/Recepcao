import { useState } from "react";

import UserTable from "./table/UserTable";
import UserModal from "./modal/UserModal";

const Users = () => {
  // UserModal
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [userTarget, setUserTarget] = useState(null);

  return (
    <>
      <UserModal
        visible={isEditVisible}
        onHide={() => setIsEditVisible(false)}
        userTarget={userTarget}
        setUserTarget={setUserTarget}
      />

      <UserTable
        setEditIsVisible={setIsEditVisible}
        setUserTarget={setUserTarget}
      />
    </>
  );
};

export default Users;
