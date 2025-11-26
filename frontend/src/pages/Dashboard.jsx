import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard = () => {
  const stats = [
    { title: 'Patients', value: '1,234', icon: 'fas fa-user-injured', color: 'primary' },
    { title: 'Rendez-vous', value: '45', icon: 'fas fa-calendar-check', color: 'success' },
    { title: 'Médecins', value: '28', icon: 'fas fa-user-md', color: 'info' },
    { title: 'Produits', value: '156', icon: 'fas fa-pills', color: 'warning' }
  ];

  return (
    <Container>
      <h1 className="mb-4">Tableau de Bord</h1>
      
      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col md={3} key={index} className="mb-3">
            <Card className={`stats-card modern-card border-${stat.color}`}>
              <Card.Body className="text-center">
                <div className={`stats-icon text-${stat.color}`}>
                  <i className={stat.icon}></i>
                </div>
                <div className="stats-number">{stat.value}</div>
                <div className="stats-label">{stat.title}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={6}>
          <Card className="modern-card">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Activité Récente
              </h5>
            </Card.Header>
            <Card.Body>
              <p>Bienvenue dans votre tableau de bord MediCare Pro.</p>
              <p>Utilisez le menu de navigation pour accéder aux différentes fonctionnalités.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="modern-card">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Notifications
              </h5>
            </Card.Header>
            <Card.Body>
              <p>Aucune notification pour le moment.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;