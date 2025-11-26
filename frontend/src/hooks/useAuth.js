import { useState, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé within an AuthProvider');
  }
  return context;
};

export const useAuthLogic = () => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      return token && userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 🔥 AUTHENTIFICATION SIMULÉE - À REMPLACER PAR VOTRE API RÉELLE
      // Pour tester, utilisez n'importe quel email/mot de passe
      if (email && password) {
        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Création d'un utilisateur de test
        const userData = {
          id: 1,
          name: 'Admin Test',
          email: email,
          role: 'admin', // Changez le rôle pour tester différents accès
          CIN: 'AB123456'
        };
        
        const token = 'fake-jwt-token-for-testing';
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Email et mot de passe requis' };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setLoading(false);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const hasRole = (role) => user?.role === role;

  return {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading
  };
};

export default AuthContext;