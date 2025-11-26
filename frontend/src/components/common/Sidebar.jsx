import React from 'react';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/rendezvous', icon: 'fas fa-calendar-check', label: 'Rendez-vous' },
    { path: '/produits', icon: 'fas fa-pills', label: 'Produits' },
    { path: '/diagnostics', icon: 'fas fa-stethoscope', label: 'Diagnostics' },
  ];

  // Ajouter la gestion des utilisateurs seulement pour l'admin
  if (user?.role === 'admin') {
    menuItems.push({ 
      path: '/users', 
      icon: 'fas fa-users-cog', 
      label: 'Utilisateurs' 
    });
  }

  return (
    <div className="sidebar bg-dark text-white">
      <div className="sidebar-sticky">
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