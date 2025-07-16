import React from "react";
import SidebarComponent from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <div className="grid-container">
        <main className="dashboardMain fullpage noScroll p-grid">
          <SidebarComponent />
          <section className="sectionContent p-col h-100">{children}</section>
        </main>
      </div>
    </div>
  );
};

export default Layout; 