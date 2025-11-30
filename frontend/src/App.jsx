import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DiagnosticsMedecin from "./pages/diagnostics/DiagnosticsMedecin";
import AuthProvider from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import Footer from "./components/common/Footer";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Patients from "./pages/Patients";
import RendezVousInfirmier from "./pages/MesRendezVous/RendezVousInfirmier";
import RendezVousMedecin from "./pages/MesRendezVous/RendezVousMedecin";
import RendezVousReceptionniste from "./pages/MesRendezVous/RendezVousReceptionniste";
import RendezVousPatient from "./pages/MesRendezVous/RendezVousPatient";
import RendezVous from "./pages/MesRendezVous/RendezVous";
import Produits from "./pages/Produits";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.scss";
import DiagnosticsInfermier from './pages/diagnostics/DiagnosticsInfermier';
import Signale from './pages/Signales/Signale';
import SignaleMagasinier from './pages/Signales/SignaleMagasinier';
import VoirMedecins from './pages/VoirMedecins';
import ModifierInfos from './pages/ModifierInfos';
import DiagnosticsPatient from "./pages/diagnostics/DiagnosticsPatient";
import DiagnosticsEtPatients from "./pages/diagnostics/Diagnostics&Patient";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.scss';


// Composant de chargement
const LoadingSpinner = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Chargement...</span>
    </div>
  </div>
);

// Route protégée avec vérification du rôle
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children;
};

// Layout principal avec sidebar adaptée au rôle
const MainLayout = () => {
  const { user } = useAuth(); // Déclaration conservée si nécessaire

  // Exemple d'utilisation de user (supprimez si pas nécessaire)
  console.log("Utilisateur connecté:", user?.nom);

  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <Routes>
            {/* Tableau de bord selon le rôle */}

            <Route path="/" element={<Dashboard />} />

            {/*Route Signale  */}
            <Route
              path="/signale"
              element={
                <ProtectedRoute allowedRoles={["infirmier"]}>
                  <Signale />
                </ProtectedRoute>
              }
            />

            {/*Route Signale pour magasinier  */}
            <Route
              path="/signaleMagasinier"
              element={
                <ProtectedRoute allowedRoles={["magasinier"]}>
                  <SignaleMagasinier />
                </ProtectedRoute>
              }
            />
            {/* Routes Admin */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="/patients" element={<Patients />} />
            <Route
              path="/rendezvous-medecin"
              element={
                <ProtectedRoute allowedRoles={["medecin"]}>
                  <RendezVousMedecin />
                </ProtectedRoute>
              }
            />

            {/* Routes communes */}
            <Route
              path="/rendezvous-rec"
              element={
                <ProtectedRoute allowedRoles={["receptionniste"]}>
                  <RendezVousReceptionniste />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rendezvous-patient"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <RendezVousPatient />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/rendezvous"
              element={
                <ProtectedRoute
                  allowedRoles={[ "receptionniste", "patient"]}
                >
                  <RendezVous />
                </ProtectedRoute>
              }
            /> */}
            {/* Route pour infirmier */}

            <Route
              path="/rendezvous-infirmier"
              element={
                <ProtectedRoute allowedRoles={["infirmier"]}>
                  <RendezVousInfirmier />
                </ProtectedRoute>
              }
            />

            <Route
              path="/voirMedecins"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <VoirMedecins />
                </ProtectedRoute>
              }
            />

            <Route
              path="/modifierInfos"
              element={
                <ProtectedRoute>
                  <ModifierInfos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/produits"
              element={
                <ProtectedRoute allowedRoles={["admin", "magasinier"]}>
                  <Produits />
                </ProtectedRoute>
              }
            />

            <Route path="/diagnostics&Patient" element={
              <ProtectedRoute allowedRoles={['admin', 'medecin','receptionniste']}>
                <DiagnosticsEtPatients />
              </ProtectedRoute>
            } />

            <Route path="/diagnosticsInfermier" element={
              <ProtectedRoute allowedRoles={['infirmier']}>
                <DiagnosticsInfermier />
              </ProtectedRoute>
            } />

            <Route path="/mesDiagnostics" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DiagnosticsPatient />
              </ProtectedRoute>
            } />
            <Route path="/diagnosticsMedecin" element={
              <ProtectedRoute allowedRoles={['medecin']}>
                <DiagnosticsMedecin />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Page non autorisée
const Unauthorized = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <div className="text-center">
      <h1 className="text-danger"> Accès Non Autorisé</h1>
      <p>
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>
        Retour
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
