import React from 'react';
import Logo from './Logo';
import '../styles/layout.css';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

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
        <Logo />
        <h1>{title}</h1>
      </div>
      <div className='content-wrapper'>
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="main-view">
          {children}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
