import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, Table, Alert, Spinner, Badge, Card, Button, Row, Col 
} from 'react-bootstrap';
import { rendezVousAPI, userAPI } from '../../Services/api';

// Configuration des statuts
const STATUS_CONFIG = {
  'prévu': { badge: 'warning', text: 'Prévu', actions: ['confirmé', 'annulé'] },
  'confirmé': { badge: 'info', text: 'Confirmé', actions: ['terminé', 'prévu'] },
  'terminé': { badge: 'success', text: 'Terminé', actions: [] },
  'annulé': { badge: 'danger', text: 'Annulé', actions: [] },
  'planifié': { badge: 'warning', text: 'Planifié', actions: [] }
};

const RendezVousMedecin = () => {
  // États principaux
  const [rendezVous, setRendezVous] = useState([]);
  const [mesRendezVous, setMesRendezVous] = useState([]);
  const [patients, setPatients] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Médecin actuel (à remplacer par les données réelles d'authentification)
  const [currentMedecin] = useState({
    id_medecin: 2,
    nom: 'Bernard',
    prenom: 'Marie',
    specialite: 'Cardiologue'
  });

  // Fonctions utilitaires
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  }, []);

  // Charger tous les utilisateurs (pour récupérer les patients)
  const loadAllUsers = useCallback(async () => {
    try {
      const response = await userAPI.getAllUsers();
      const usersData = response.data?.data || response.data || [];
      setUsers(usersData);
      return usersData;
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      return [];
    }
  }, []);

  // Charger les informations spécifiques d'un patient
  const loadPatientInfo = useCallback(async (patientId) => {
    try {
      const response = await userAPI.getPatientById(patientId);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Erreur patient ${patientId}:`, err);
      return null;
    }
  }, []);

  // Fusionner les données patient avec les données utilisateur
  const getMergedPatientData = useCallback((patientId) => {
    const patientDetails = patients[patientId];
    const userData = users.find(user => 
      user.role === 'patient' || 
      (patientDetails && user.CIN === patientDetails.CIN) ||
      user.id === patientId
    );

    if (!userData && !patientDetails) return null;

    return {
      ...userData,
      ...patientDetails,
      fullName: patientDetails ? 
        `${patientDetails.prenom || ''} ${patientDetails.nom || ''}`.trim() :
        userData ? `${userData.prenom || ''} ${userData.nom || ''}`.trim() : 'Patient inconnu'
    };
  }, [patients, users]);

  // Charger les données patients pour les rendez-vous
  const loadPatientsData = useCallback(async (rendezVousList) => {
    const patientIds = [...new Set(rendezVousList.map(rdv => rdv.id_patient).filter(Boolean))];
    if (!patientIds.length) return;

    const patientsData = {};
    await Promise.all(
      patientIds.map(async (id) => {
        const patientInfo = await loadPatientInfo(id);
        if (patientInfo) {
          patientsData[id] = patientInfo;
        }
      })
    );
    setPatients(patientsData);
  }, [loadPatientInfo]);

  // Charger les rendez-vous
  const loadRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      await loadAllUsers();
      
      const response = await rendezVousAPI.getRendezVous();
      const rendezVousData = response.data?.data || response.data || [];
      const mesRDV = rendezVousData.filter(rdv => rdv.id_medecin === currentMedecin.id_medecin);
      
      setRendezVous(rendezVousData);
      setMesRendezVous(mesRDV);
      setError('');
      
      if (mesRDV.length > 0) {
        await loadPatientsData(mesRDV);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMessage);
      setRendezVous([]);
      setMesRendezVous([]);
    } finally {
      setLoading(false);
    }
  }, [currentMedecin.id_medecin, loadAllUsers, loadPatientsData]);

  // Mettre à jour le statut d'un rendez-vous
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setSubmitting(true);
      await rendezVousAPI.updateRendezVous(id, { statut: newStatus });
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Obtenir les actions disponibles pour un rendez-vous
  const getMedecinActions = useCallback((rdv) => {
    const { actions } = STATUS_CONFIG[rdv.statut] || {};
    if (!actions?.length) return <small className="text-muted">Aucune action</small>;

    const buttons = {
      'confirmé': { variant: 'outline-success', icon: 'fa-check', text: 'Confirmer' },
      'annulé': { variant: 'outline-danger', icon: 'fa-times', text: 'Annuler' },
      'terminé': { variant: 'outline-success', icon: 'fa-check-double', text: 'Terminer' },
      'prévu': { variant: 'outline-warning', icon: 'fa-calendar-alt', text: 'Reporter' }
    };

    return (
      <div className="btn-group" role="group">
        {actions.map(action => (
          <Button
            key={action}
            variant={buttons[action]?.variant}
            size="sm"
            onClick={() => handleUpdateStatus(rdv.idR, action)}
            disabled={submitting}
          >
            <i className={`fas ${buttons[action]?.icon} me-1`}></i>
            {buttons[action]?.text}
          </Button>
        ))}
      </div>
    );
  }, [submitting]);

  // Composant pour afficher les informations du patient
  const PatientInfo = useCallback(({ patientId }) => {
    const patient = getMergedPatientData(patientId);

    if (!patient) {
      return (
        <div>
          <strong>Patient ID: {patientId}</strong>
          <div>
            <small className="text-warning">
              <Spinner size="sm" className="me-1" />Chargement...
            </small>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-1">
          <strong>{patient.fullName}</strong>
        </div>
        
        <div className="small text-muted">
          {patient.CIN && (
            <div>CIN: {patient.CIN}</div>
          )}
          
          {patient.num_tel && (
            <div>📞 {patient.num_tel}</div>
          )}
          
          {patient.email && (
            <div>📧 {patient.email}</div>
          )}
        </div>
      </div>
    );
  }, [getMergedPatientData]);

  // Statistiques calculées
  const stats = useMemo(() => ({
    total: mesRendezVous.length,
    prevu: mesRendezVous.filter(rdv => rdv.statut === 'prévu').length,
    confirme: mesRendezVous.filter(rdv => rdv.statut === 'confirmé').length,
    termine: mesRendezVous.filter(rdv => rdv.statut === 'terminé').length,
    annule: mesRendezVous.filter(rdv => rdv.statut === 'annulé').length
  }), [mesRendezVous]);

  // Effects
  useEffect(() => { 
    loadRendezVous(); 
  }, [loadRendezVous]);

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
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mes Rendez-vous</h1>
        <Badge bg="primary" className="fs-6 p-2">
          {mesRendezVous.length} rendez-vous
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Dashboard Statistiques - Même style que diagnostic */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Mes Rendez-vous</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">{stats.prevu}</div>
              <div className="stats-label">Prévus</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-info">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stats-number">{stats.confirme}</div>
              <div className="stats-label">Confirmés</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success">
                <i className="fas fa-check-double"></i>
              </div>
              <div className="stats-number">{stats.termine}</div>
              <div className="stats-label">Terminés</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Deuxième ligne de statistiques */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-danger">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stats-number">{stats.annule}</div>
              <div className="stats-label">Annulés</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-primary">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stats-number">
                {[...new Set(mesRendezVous.map(rdv => rdv.id_patient))].length}
              </div>
              <div className="stats-label">Patients Uniques</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-secondary">
                <i className="fas fa-calendar-day"></i>
              </div>
              <div className="stats-number">
                {[...new Set(mesRendezVous.map(rdv => 
                  new Date(rdv.date_heure || rdv.date_rv).toDateString()
                ))].length}
              </div>
              <div className="stats-label">Jours avec RDV</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-dark">
                <i className="fas fa-hourglass-half"></i>
              </div>
              <div className="stats-number">
                {mesRendezVous.filter(rdv => 
                  ['prévu', 'confirmé'].includes(rdv.statut)
                ).length}
              </div>
              <div className="stats-label">À venir</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tableau principal */}
      {mesRendezVous.length > 0 ? (
        <>
          <Table striped bordered hover responsive className="modern-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date et Heure</th>
                <th>Statut</th>
                <th>Motif</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mesRendezVous.map((rdv) => {
                const status = STATUS_CONFIG[rdv.statut] || {};

                return (
                  <tr key={rdv.id || rdv.idR}>
                    <td>
                      <PatientInfo patientId={rdv.id_patient} />
                    </td>
                    <td className="text-nowrap">
                      {formatDate(rdv.date_heure || rdv.date_rv)}
                    </td>
                    <td>
                      <Badge bg={status.badge}>{status.text}</Badge>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '150px' }} title={rdv.motif}>
                        {rdv.motif || 'Non spécifié'}
                      </div>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '150px' }} title={rdv.notes}>
                        {rdv.notes || 'Aucune note'}
                      </div>
                    </td>
                    <td>{getMedecinActions(rdv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun rendez-vous trouvé</h4>
          <p className="text-muted">Vous n'avez aucun rendez-vous programmé pour le moment.</p>
        </div>
      )}

      {/* Bouton d'actualisation */}
      <div className="text-center mt-4">
        <Button variant="outline-primary" onClick={loadRendezVous}>
          <i className="fas fa-redo me-1"></i>Actualiser
        </Button>
      </div>

     
    </Container>
  );
};

export default RendezVousMedecin;