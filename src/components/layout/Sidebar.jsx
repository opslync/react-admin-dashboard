import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { closeSideBar, openSideBar } from "../../store/slices/sidebarSlice";
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AppsIcon from '@mui/icons-material/Apps';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { MenuIcon } from "@heroicons/react/outline";
import Logo from "../../assets/images/logo.png";
import { Typography, Tooltip, Divider } from '@mui/material';
import "../../styles/menu.css";

const menus = [
  {
    category: "Main",
    items: [
      {
        name: "Overview",
        route: "/overview",
        icon: <DashboardIcon />,
        description: "Dashboard overview and analytics"
      },
    ]
  },
  {
    category: "Development",
    items: [
      {
        name: "Projects",
        route: "/project",
        icon: <FolderOpenIcon />,
        description: "Manage your projects"
      },
      {
        name: "Applications",
        route: "/apps",
        icon: <AppsIcon />,
        description: "View and manage applications"
      },
    ]
  },
  {
    category: "Infrastructure",
    items: [
      {
        name: "Clusters",
        route: "/cluster",
        icon: <StorageIcon />,
        description: "Manage Kubernetes clusters"
      },
      {
        name: "Settings",
        route: "/settings/git-account",
        icon: <SettingsIcon />,
        description: "Configure system settings"
      },
    ]
  }
];

const MenuSection = ({ category, items }) => (
  <div className="mb-6">
    <Typography variant="caption" className="text-gray-400 px-4 uppercase font-semibold tracking-wider">
      {category}
    </Typography>
    {items.map((item, index) => (
      <Tooltip key={index} title={item.description} placement="right">
        <NavLink
          to={item.route}
          className="flex items-center py-2.5 px-4 mt-1 hover:bg-gray-700 rounded-lg transition-all duration-200"
          activeClassName="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <span className="text-gray-400 group-hover:text-white">
            {item.icon}
          </span>
          <span className="ml-3 text-sm font-medium">{item.name}</span>
        </NavLink>
      </Tooltip>
    ))}
  </div>
);

const SidebarComponent = () => {
  const history = useHistory();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerState = useSelector((state) => state.sidebar.value);
  const dispatch = useDispatch();

  useEffect(() => {
    setDrawerVisible(drawerState);
  }, [drawerState]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleUserProfileClick = () => {
    history.push('/user-profile');
  };

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-6 mb-2">
        <NavLink to="/overview" className="flex items-center">
          <img src={Logo} alt="Logo" className="h-8 w-auto" />
          <Typography 
            variant="h6" 
            className="ml-2 font-semibold text-white tracking-wide"
          >
            OpsLync
          </Typography>
        </NavLink>
      </div>

      <Divider className="bg-gray-700 mb-4" />

      <div className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menus.map((section, index) => (
          <MenuSection key={index} {...section} />
        ))}
      </div>

      <div className="mt-auto">
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
              onClick={handleUserProfileClick}
            >
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              <div>
                <Typography variant="body2" className="text-white">
                  {localStorage.getItem("username") || "User"}
                </Typography>
                <Typography variant="caption" className="text-gray-400">
                  Admin
                </Typography>
              </div>
            </div>
            <Tooltip title="Logout" placement="top">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <LogoutIcon className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PrimeSidebar
        visible={drawerVisible}
        onHide={() => dispatch(closeSideBar())}
        className="p-0 bg-gray-800"
      >
        {SidebarContent}
      </PrimeSidebar>

      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
        onClick={() => dispatch(drawerVisible ? closeSideBar() : openSideBar())}
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <div className="hidden lg:block w-64 h-screen fixed top-0 left-0 bg-gray-800 text-white shadow-xl">
        {SidebarContent}
      </div>
    </>
  );
};

export default SidebarComponent; 