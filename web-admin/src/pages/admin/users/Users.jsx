import { useState } from "react";

import UserTable from "./table/UserTable";
import UserModal from "./modal/UserModal";
import UserDeleteModal from "./modal/UserDeleteModal";

const Users = () => {
  // UserModal
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isExcludeVisible, setIsExcludeVisible] = useState(false);
  const [userTarget, setUserTarget] = useState(null);

  return (
    <>
      <UserModal
        visible={isEditVisible}
        onHide={() => setIsEditVisible(false)}
        userTarget={userTarget}
        setUserTarget={setUserTarget}
      />

      <UserDeleteModal
        visible={isExcludeVisible}
        onHide={() => setIsExcludeVisible(false)}
        userTarget={userTarget}
        setUserTarget={setUserTarget}
      />
      <UserTable
        setEditIsVisible={setIsEditVisible}
        setExcludeIsVisible={setIsExcludeVisible}
        setUserTarget={setUserTarget}
      />
    </>
  );
};

export default Users;
