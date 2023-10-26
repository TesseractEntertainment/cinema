import React from 'react';
import '../styles/layout.css';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ErrorComponent from './Error';

interface LayoutProps {
  title: string;
  children?: React.ReactNode;
}

/*
* The Layout component is a wrapper component that is used to wrap the main view of the application.
* It is responsible for rendering the top bar, sidebar, and main view.
*/
const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="layout-container">
      <div className="top-bar">
        <Topbar title={title} />
      </div>
      <div className='content-wrapper'>
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="main-view">
          <div className="error-container">
            <ErrorComponent />
          </div>
          {children}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
