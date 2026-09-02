import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../../context/profile/ProfileContext";

const SideNav = () => {
  const [tab, setTab] = useState(location.pathname);
  const { user } = useProfile();

  const navigation = [
    {
      name: "Dashboard",
      path: "/Admin",
      icon: "pi-chart-bar",
      role: ["user", "admin", "superadmin"],
    },
    {
      name: "Visitors",
      path: "/Admin/Visitors",
      icon: "pi-pen-to-square",
      role: ["user", "admin", "superadmin"],
    },
    {
      name: "Users",
      path: "/Admin/Users",
      icon: "pi-user",
      role: ["admin", "superadmin"],
    },
    // { name: "Calendar", path: "/Admin/Calendar", icon: "pi-calendar" },
    {
      name: "Visits",
      path: "/Admin/visits",
      icon: "pi-cog",
      role: ["user", "admin", "superadmin"],
    },
    {
      name: "Configurations",
      path: "/Admin/Configurations",
      icon: "pi-cog",
      role: ["user", "admin", "superadmin"],
    },
  ];

  return (
    <div
      className="bg-background md:w-60 md:block shadow md:p-6 p-2 relative"
      id="SideNav"
    >
      <ul className="flex md:flex-col flex-row gap-4 w-full">
        {navigation.map((item, index) => {
          if (item.role.includes(user?.role)) {
            return (
              <li
                key={index}
                className={`rounded-md md:text-start text-center text-nowrap text-font-secondary ${
                  tab === item.path ? "selected" : ""
                }`}
                onClick={() => {
                  setTab(item.path);
                }}
              >
                <Link
                  to={`${item.path}`}
                  className="flex items-center w-full h-full p-1 pr-2"
                >
                  <i className={`pi ${item.icon} p-2`}></i> {item.name}
                </Link>
              </li>
            );
          }
          return null;
        })}
      </ul>

      <div className="absolute bottom-0">
        {user?.role && <h1>Role: {user.role}</h1>}
      </div>
    </div>
  );
};

export default SideNav;
