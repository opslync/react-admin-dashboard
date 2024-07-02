import React, { useRef } from "react";
import "../assets/css/header.css";
import Logo from "../assets/images/logo.png";
import Avatar from "../assets/images/avatar.jpg";
import { useDispatch } from "react-redux";
import { openSideBar } from "../library/store/sidebar";
import { Menu } from "primereact/menu";
import { useHistory } from "react-router-dom";

export default function Header() {
  const history = useHistory();
  const userMenuRef = useRef(null);

  const dispatch = useDispatch();

  const userMenu = [
    {
      label: `Hi, ${localStorage.getItem("username") || "User"}`,
      items: [
        {
          label: "Home",
          icon: "pi pi-home",
          command: (e) => {
            history.push("/overview");
          },
        },
        {
          label: "Profile",
          icon: "pi pi-user",
          command: (e) => {
            history.push("/user-profile");
          },
        },
        {
          label: "Logout",
          icon: "pi pi-power-off",
          command: (e) => {
            localStorage.clear();
            history.push("/login");
          },
        },
      ],
    },
  ];

  const togglePanel = (e, ref) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector(".emptyBoxForMenuClick").click();
    ref.current.toggle(e);
  };

  return (
    <>
      <div className="header-box d-flex p-ai-center">
        <div>
          <img src={Logo} alt="Logo" className="img img-fluid logo" />
        </div>
        <div className="ml-auto menu-items mr-0">
          <ul className="nav-list d-flex p-ai-center flex-row-reverse">
            <li>
              <img
                src={Avatar}
                alt="user"
                id="avatar"
                className="avatar"
                onClick={(e) => togglePanel(e, userMenuRef)}
              />
            </li>
          </ul>
        </div>
      </div>
      <Menu model={userMenu} popup ref={userMenuRef} id="user_pop_menu" />
      <div className="emptyBoxForMenuClick"></div>
    </>
  );
}
