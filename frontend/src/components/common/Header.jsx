import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="modern-header">
      <Container fluid>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <i className="fas fa-hospital me-2"></i>
          <span className="fw-bold">MediCare Pro</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                <i className="fas fa-user me-2"></i>
                {user?.name || 'Profile'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#">
                  <i className="fas fa-cog me-2"></i>
                  Paramètres
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/modifierInfos')}>
                  <i className="fas fa-user me-2"></i>
                  Modifier Infos
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;