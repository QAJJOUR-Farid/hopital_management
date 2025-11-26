import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <h6 className="mb-0 fw-bold">
              <i className="fas fa-hospital me-2 text-primary"></i>
              MediCare Pro
            </h6>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0 text-muted">
              &copy; {new Date().getFullYear()} Système de Gestion Hospitalière. 
              <span className="d-none d-md-inline"> Tous droits réservés.</span>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;