import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { closeSideBar, openSideBar } from "../library/store/sidebar";
import "../assets/css/menu.css";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import AppsIcon from '@mui/icons-material/Apps';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { MenuIcon } from "@heroicons/react/outline";
import Logo from "../assets/images/logo.png"; // Import the logo image
import { Typography } from '@mui/material';

export default function SideBar() {
  const [drawerVisible, setDrawerVisible] = useState(false); // Set initial state to false
  const drawerState = useSelector((state) => state.sidebar.value);
  const dispatch = useDispatch();

  useEffect(() => {
    setDrawerVisible(drawerState);
  }, [drawerState]);

  const toggleDrawer = () => {
    if (drawerVisible) {
      dispatch(closeSideBar());
    } else {
      dispatch(openSideBar());
    }
  };

  return (
    <div>
      {/* side drawer for mobile */}
      <Sidebar
        visible={drawerVisible}
        onHide={() => {
          dispatch(closeSideBar());
        }}
      >
        {menuContent}
      </Sidebar>

      {/* toggle button */}
      <button
        className="lg:hidden p-2 fixed top-4 left-4 z-50 bg-blue-500 text-white rounded-full"
        onClick={toggleDrawer}
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* normal sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-full fixed top-0 left-0 bg-gray-800 text-white z-40">
        {menuContent}
      </div>
    </div>
  );
}

const menus = [
  {
    name: "Overview",
    route: "/overview",
    icon: <DashboardIcon />,
    iconType: "component",
  },
  {
    name: "Project",
    route: "/project",
    icon: <FolderOpenIcon />,
    iconType: "component",
  },
  {
    name: "Apps",
    route: "/apps",
    icon: <AppsIcon />,
    iconType: "component",
  },
  {
    name: "Setting",
    route: "/settings/git-account",
    icon: <SettingsIcon />,
    iconType: "component",
  },
];

const menuContent = (
  <div className="p-4">
    {/* Logo and text at the top */}
    <div className="flex items-center justify-center mb-6">
      <NavLink to="/overview" className="flex items-center">
        <img src={Logo} alt="Logo" className="h-7 mr-2" />
        <Typography variant="h6" className="text-white">OpsLync</Typography>
      </NavLink>
    </div>
    {menus.map((item, index) => (
      <NavLink
        key={index}
        to={item.route}
        className="flex items-center py-2 px-4 hover:bg-gray-700 rounded"
        activeClassName="bg-gray-900"
      >
        {item.iconType === "component" && item.icon}
        <span className="ml-2">{item.name}</span>
      </NavLink>
    ))}
  </div>
);
