import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Alert,
  Spinner,
  Card,
  Badge,
} from 'react-bootstrap';
import { diagnosticsAPI, patientsAPI } from '../../Services/api';
import { useAuth } from '../../hooks/useAuth';

const DiagnosticsPatient = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'patient') {
      loadPatientDiagnostics();
    }
  }, [user]);

  const loadPatientDiagnostics = async () => {
    try {
      setLoading(true);
      setError('');

      // First, get all patients to find the current user's patient record
      const patientsResponse = await patientsAPI.getAllPatients();
      const currentPatient = patientsResponse.data.find(p => p.CIN === user.CIN);

      if (!currentPatient) {
        setError('Informations patient non trouvées');
        return;
      }

      const patientId = currentPatient.id_patient;

      const response = await diagnosticsAPI.getDiagnosticByPatientId(patientId);
      console.log('Diagnostics du patient chargés:', response.data);
      setDiagnostics(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement de vos diagnostics';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir le nom complet d'un utilisateur
  const getFullName = (user) => {
    if (!user) return '';
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  };

  // Fonction pour obtenir le nom du médecin
  const getMedecinName = (diagnostic) => {
    if (diagnostic.medecin && diagnostic.medecin.user) {
      return `Dr. ${getFullName(diagnostic.medecin.user)}`;
    }
    return 'N/A';
  };

  // Fonction pour obtenir le CIN du médecin
  const getMedecinCIN = (diagnostic) => {
    if (diagnostic.medecin && diagnostic.medecin.user) {
      return diagnostic.medecin.user.CIN || 'N/A';
    }
    return 'N/A';
  };

  // Fonction pour générer une clé unique
  const getUniqueKey = (diagnostic, index) => {
    const diagnosticId = diagnostic.idD || diagnostic.id || diagnostic.id_diagnostic;
    return diagnosticId || `diagnostic-${index}-${Date.now()}`;
  };

  // Fonction pour obtenir le badge d'état
  const getEtatBadge = (etat) => {
    switch (etat) {
      case 'actif':
        return <Badge bg="success">Actif</Badge>;
      case 'inactif':
        return <Badge bg="secondary">Inactif</Badge>;
      case 'terminé':
        return <Badge bg="primary">Terminé</Badge>;
      case 'enAttente':
        return <Badge bg="warning">En attente</Badge>;
      default:
        return <Badge bg="light" text="dark">{etat || 'N/A'}</Badge>;
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

  if (!user || user.role !== 'patient') {
    return (
      <Container>
        <Alert variant="warning">
          <h4>Accès non autorisé</h4>
          <p>Cette page est réservée aux patients.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mes Diagnostics</h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <div className="row mb-4">
        <div className="col-md-4">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stats-number">{diagnostics.length}</div>
              <div className="stats-label">Mes Diagnostics</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stats-number">
                {diagnostics.filter(d => d.etat === 'terminé').length}
              </div>
              <div className="stats-label">Terminés</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">
                {diagnostics.filter(d => d.etat === 'enAttente').length}
              </div>
              <div className="stats-label">En Attente</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>Médecin</th>
            <th>Date</th>
            <th>Description</th>
            <th>Résultats</th>
            <th>État</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((diagnostic, index) => {
            return (
              <tr key={getUniqueKey(diagnostic, index)}>
                <td>
                  <strong>{getMedecinName(diagnostic)}</strong>
                  <br />
                </td>

                <td>{formatDate(diagnostic.dateD)}</td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '200px' }} title={diagnostic.description}>
                    {diagnostic.description || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '200px' }} title={diagnostic.resultats}>
                    {diagnostic.resultats || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  {getEtatBadge(diagnostic.etat)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {diagnostics.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-stethoscope fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun diagnostic trouvé</h4>
          <p className="text-muted">Vous n'avez pas encore de diagnostics enregistrés.</p>
        </div>
      )}
    </Container>
  );
};

export default DiagnosticsPatient;
