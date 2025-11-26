import React from 'react';
import AuthContext, { useAuthLogic } from '../hooks/useAuth';

const AuthProvider = ({ children }) => {
  const authData = useAuthLogic();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;