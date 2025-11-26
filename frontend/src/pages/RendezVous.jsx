import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { rendezVousAPI } from '../Services/api';

const RendezVous = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRendezVous();
  }, []);

  const loadRendezVous = async () => {
    try {
      setLoading(true);
      const response = await rendezVousAPI.getRendezVous();
      setRendezVous(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des rendez-vous');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'programmé': 'warning',
      'confirmé': 'info',
      'terminé': 'success',
      'annulé': 'danger'
    };
    return statusConfig[status] || 'secondary';
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
        <h1>Gestion des Rendez-vous</h1>
        <Button variant="primary">
          <i className="fas fa-plus me-2"></i>
          Nouveau Rendez-vous
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Médecin</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rendezVous.map((rdv) => (
            <tr key={rdv.id}>
              <td>#{rdv.id}</td>
              <td>{rdv.patient_nom || 'N/A'}</td>
              <td>{rdv.medecin_nom || 'N/A'}</td>
              <td>{new Date(rdv.date_rendezvous).toLocaleDateString()}</td>
              <td>{rdv.heure}</td>
              <td>
                <Badge bg={getStatusBadge(rdv.statut)}>
                  {rdv.statut}
                </Badge>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Button variant="outline-primary" size="sm">
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button variant="outline-success" size="sm">
                    <i className="fas fa-check"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default RendezVous;