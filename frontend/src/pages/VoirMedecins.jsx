import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Card,
  Badge,
  Spinner,
  Alert,
  Row,
  Col
} from 'react-bootstrap';
import { userAPI } from '../Services/api';

const VoirMedecins = () => {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userAPI.getAllMedecins();
      console.log('Médecins chargés:', response.data);
      setMedecins(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des médecins';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getFullName = (user) => {
    if (!user) return '';
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  };

  const getSpecialiteBadge = (specialite) => {
    const colors = {
      'Cardiologie': 'danger',
      'Dermatologie': 'warning',
      'Ophtalmologie': 'info',
      'Pédiatrie': 'success',
      'Gynécologie': 'primary',
      'Neurologie': 'secondary',
      'Orthopédie': 'dark'
    };

    return (
      <Badge bg={colors[specialite] || 'secondary'} className="fs-6">
        {specialite}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Nos Médecins</h1>
        <Badge bg="info" className="fs-6">
          {medecins.length} médecin{medecins.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stats-number">{medecins.length}</div>
              <div className="stats-label">Médecins</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-primary">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stats-number">
                {new Set(medecins.map(m => m.specialite)).size}
              </div>
              <div className="stats-label">Spécialités</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stats-number">
                {medecins.length > 0 ? Math.min(...medecins.map(m => m.annee_travail)) : 0}
              </div>
              <div className="stats-label">Année la plus ancienne</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">
                {new Date().getFullYear() - (medecins.length > 0 ? Math.min(...medecins.map(m => m.annee_travail)) : new Date().getFullYear())}
              </div>
              <div className="stats-label">Années d'expérience</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tableau des médecins */}
      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>Nom et Prénom</th>
            <th>Email</th>
            <th>Spécialité</th>
            <th>Année de début</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {medecins.map((medecin, index) => (
            <tr key={medecin.id_medecin || `medecin-${index}`}>
              <td>
                <div>
                  <strong>{getFullName(medecin.user)}</strong>
                  <br />
                  <small className="text-muted">ID: {medecin.id_medecin}</small>
                </div>
              </td>
              <td>
                <a href={`mailto:${medecin.user?.email}`} className="text-decoration-none">
                  {medecin.user?.email || 'N/A'}
                </a>
              </td>
              <td>{getSpecialiteBadge(medecin.specialite)}</td>
              <td>
                <Badge bg="light" text="dark" className="fs-6">
                  {medecin.annee_travail}
                </Badge>
                <br />
                <small className="text-muted">
                  ({new Date().getFullYear() - medecin.annee_travail} ans d'expérience)
                </small>
              </td>
              <td>
                <div className="text-truncate" style={{ maxWidth: '300px' }} title={medecin.description}>
                  {medecin.description || 'Aucune description disponible'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {medecins.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-user-md fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun médecin trouvé</h4>
          <p className="text-muted">Il n'y a actuellement aucun médecin enregistré dans le système.</p>
        </div>
      )}

      {/* Vue en cartes pour mobile */}
      <div className="d-md-none mt-4">
        <h3 className="mb-3">Vue détaillée</h3>
        <Row>
          {medecins.map((medecin, index) => (
            <Col md={6} key={medecin.id_medecin || `medecin-card-${index}`} className="mb-3">
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <strong>{getFullName(medecin.user)}</strong>
                </Card.Header>
                <Card.Body>
                  <p><strong>Email:</strong> {medecin.user?.email || 'N/A'}</p>
                  <p><strong>Spécialité:</strong> {getSpecialiteBadge(medecin.specialite)}</p>
                  <p><strong>Année de début:</strong> {medecin.annee_travail}</p>
                  <p><strong>Description:</strong> {medecin.description || 'Aucune description disponible'}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default VoirMedecins;
