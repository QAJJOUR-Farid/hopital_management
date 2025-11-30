import React from 'react';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';


const Sidebar = () => {
  const { user } = useAuth();

  // Configuration des menus par rôle
  const getMenuItems = () => {
    const baseItems = [
      { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/users', icon: 'fas fa-users-cog', label: 'Utilisateurs' },
          { path: '/Patients', icon: 'fas fa-user-injured', label: 'Patients' },
          { path: '/diagnostics&Patient', icon: 'fas fa-stethoscope', label: 'Diagnostics' },
          { path: '/produits', icon: 'fas fa-pills', label: 'Produits' }
        ];
    
      case 'medecin':
        return [
          ...baseItems,
          { path: '/rendezvous', icon: 'fas fa-calendar-check', label: 'Mes Rendez-vous' },
          { path: '/diagnosticsMedecin', icon: 'fas fa-stethoscope', label: 'Diagnostics' },
          { path: '/diagnostics&Patient', icon: 'fas fa-stethoscope', label: 'Patients' },
          { path: '/rendezvous-medecin', icon: 'fas fa-calendar-check', label: 'Mes Rendez-vous' }
        ];
      
      case 'infirmier':
        return [
          ...baseItems,
          { path: '/rendezvous-infirmier', icon: 'fas fa-calendar-check', label: 'Rendez-vous' } ,
          { path: '/diagnosticsInfermier', icon: 'fas fa-stethoscope', label: 'Soins & Diagnostics' },
          { path: '/signale', icon: 'fas fa-calendar-check', label: 'Signale' }
        ];
      
      case 'receptionniste':
        return [
          ...baseItems,
          { path: '/rendezvous', icon: 'fas fa-calendar-check', label: 'Rendez-vous' },
          { path: '/diagnostics&Patient', icon: 'fas fa-stethoscope', label: 'Patients' },
          { path: '/rendezvous-rec', icon: 'fas fa-calendar-check', label: 'Rendez-vous' }
        ];
      
      case 'magasinier':
        return [
          ...baseItems,
          { path: '/produits', icon: 'fas fa-pills', label: 'Gestion Stock' },
          
          { path: '/signaleMagasinier', icon: 'fas fa-pills', label: 'Signale' }
        ];
      
      case 'patient':
        return [
          ...baseItems,
          { path: '/rendezvous', icon: 'fas fa-calendar-check', label: 'Mes Rendez-vous' },
          { path: '/voirMedecins', icon: 'fas fa-prescription', label: 'Médecins' },
          { path: '/mesDiagnostics', icon: 'fas fa-prescription', label: 'Mes Diagnostics' },
          { path: '/rendezvous-patient', icon: 'fas fa-calendar-check', label: 'Mes Rendez-vous' },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="sidebar bg-dark text-white">
      <div className="sidebar-sticky">
        <div className="p-3 border-bottom">
          <small className="text-muted">Connecté en tant que:</small>
          <div className="fw-bold text-capitalize">{user?.role}</div>
        </div>
        <Nav className="flex-column p-3">
          {menuItems.map((item, index) => (
            <Nav.Link 
              key={index} 
              href={item.path}
              className="text-white mb-2 sidebar-link d-flex align-items-center"
            >
              <i className={`${item.icon} me-2`}></i>
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;