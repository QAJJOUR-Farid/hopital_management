import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './providers/AuthProvider';
import { useAuth } from './hooks/useAuth';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer'; // ← Doit pointer vers un fichier avec export default
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import RendezVous from './pages/RendezVous';
import Produits from './pages/Produits';
import Diagnostics from './pages/Diagnostics';
import Login from './components/auth/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.scss';

// Composant de chargement
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Chargement...</span>
    </div>
  </div>
);

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Layout principal
const MainLayout = () => {
  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/rendezvous" element={<RendezVous />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;