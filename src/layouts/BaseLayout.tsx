import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import styles from '../styles/common.module.css';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.layoutMain}>
        <Topbar />
        <div className={styles.layoutContent}>{children}</div>
      </div>
    </div>
  );
};

export default BaseLayout;
