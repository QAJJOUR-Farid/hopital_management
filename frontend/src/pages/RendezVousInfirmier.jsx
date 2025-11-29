import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge, Card } from 'react-bootstrap';
import { rendezVousAPI } from '../Services/api';

const RendezVousInfirmier = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRendezVous();
  }, []);

  const loadRendezVous = async () => {
    try {
      setLoading(true);
      // ✅ CORRECTION : Utiliser getRenadezVous() au lieu de getAllRendezVous()
      const response = await rendezVousAPI.getRendezVous();
      console.log('Rendez-vous chargés:', response.data);
      
      // Adaptez cette partie selon la structure de votre réponse API
      if (response.data && Array.isArray(response.data)) {
        // Si l'API retourne directement un tableau
        setRendezVous(response.data);
      } else if (response.data && response.data.data) {
        // Si l'API retourne { data: [], success: true }
        setRendezVous(response.data.data);
      } else if (response.data && response.data.success) {
        // Si l'API retourne { success: true, data: [] }
        setRendezVous(response.data.data || []);
      } else {
        setRendezVous([]);
      }
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des rendez-vous';
      setError(`Erreur: ${errorMessage}`);
      console.error('Erreur détaillée:', err);
      setRendezVous([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'prévu': 'warning',
      'confirmé': 'info',
      'terminé': 'success',
      'annulé': 'danger',
      'planifié': 'warning'
    };
    return statusConfig[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'prévu': 'Prévu',
      'confirmé': 'Confirmé',
      'terminé': 'Terminé',
      'annulé': 'Annulé',
      'planifié': 'Planifié'
    };
    return statusTexts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide '+ error;
    }
  };

  if (loading && rendezVous.length === 0) {
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
      {/* En-tête simplifié */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Rendez-vous Médicaux</h1>
          <p className="text-muted">Vue infirmier - Consultation des rendez-vous</p>
        </div>
        <Badge bg="primary" className="fs-6">
          {rendezVous.length} rendez-vous
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <strong>Erreur:</strong> {error}
        </Alert>
      )}

      {/* Tableau des rendez-vous seulement */}
      <Card className="modern-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Liste des Rendez-vous</h5>
          <Badge bg="info">{rendezVous.length} rendez-vous</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0 modern-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date et Heure</th>
                <th>Statut</th>
                <th>Motif</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rendezVous.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <i className="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                    <p className="text-muted">Aucun rendez-vous trouvé</p>
                  </td>
                </tr>
              ) : (
                rendezVous.map((rdv) => (
                  <tr key={rdv.id || rdv.idR}>
                    <td>
                      <strong>{rdv.patient?.nom || 'patient '} {rdv.patient?.prenom || ''}</strong>
                      {rdv.patient?.CIN && (
                        <div>
                          <small className="text-muted">CIN: {rdv.patient.CIN}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{rdv.medecin?.nom || 'medecin'} {rdv.medecin?.prenom || ''}</strong>
                      {rdv.medecin?.specialite && (
                        <div>
                          <small className="text-muted">{rdv.medecin.specialite}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      {formatDate(rdv.date_heure || rdv.date_rv)}
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(rdv.statut)}>
                        {getStatusText(rdv.statut)}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">{rdv.motif || 'Non spécifié'}</small>
                    </td>
                    <td>
                      <small className="text-muted">{rdv.notes || 'Aucune note'}</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RendezVousInfirmier;