import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <Outlet /> {/* Ici s'affichent les pages enfants */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;