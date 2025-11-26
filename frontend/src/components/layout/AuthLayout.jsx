import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-container">
      <Outlet /> {/* Page de login */}
    </div>
  );
};

export default AuthLayout;