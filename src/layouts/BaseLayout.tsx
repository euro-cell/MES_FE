import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/common.css';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className='dashboard-page'>
      <div className='container'>
        <Sidebar />
        <div className='main'>
          <Topbar />
          <div className='content'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
