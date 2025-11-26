import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { diagnosticsAPI } from '../Services/api';

const Diagnostics = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const response = await diagnosticsAPI.getDiagnostics();
      setDiagnostics(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des diagnostics');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiagnostic = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce diagnostic ?')) {
      try {
        await diagnosticsAPI.deleteDiagnostic(id);
        setDiagnostics(diagnostics.filter(diag => diag.id !== id));
        alert('Diagnostic supprimé avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error('Erreur:', err);
      }
    }
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
        <h1>Gestion des Diagnostics</h1>
        <Button variant="primary">
          <i className="fas fa-plus me-2"></i>
          Nouveau Diagnostic
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stats-number">{diagnostics.length}</div>
              <div className="stats-label">Diagnostics Totaux</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Médecin</th>
            <th>Date</th>
            <th>Diagnostic</th>
            <th>Traitement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((diagnostic) => (
            <tr key={diagnostic.id}>
              <td>#{diagnostic.id}</td>
              <td>{diagnostic.patient_nom || 'N/A'}</td>
              <td>{diagnostic.medecin_nom || 'N/A'}</td>
              <td>{new Date(diagnostic.date_diagnostic).toLocaleDateString()}</td>
              <td>
                <Badge bg="info" className="text-truncate" style={{ maxWidth: '200px' }}>
                  {diagnostic.diagnostic || 'Non spécifié'}
                </Badge>
              </td>
              <td>
                <Badge bg="success" className="text-truncate" style={{ maxWidth: '200px' }}>
                  {diagnostic.traitement || 'Non spécifié'}
                </Badge>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Button variant="outline-primary" size="sm">
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteDiagnostic(diagnostic.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {diagnostics.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-stethoscope fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun diagnostic trouvé</h4>
          <p className="text-muted">Commencez par créer un nouveau diagnostic.</p>
        </div>
      )}
    </Container>
  );
};

export default Diagnostics;