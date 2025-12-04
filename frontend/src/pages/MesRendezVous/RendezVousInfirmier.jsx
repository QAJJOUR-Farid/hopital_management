import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge, Card, Button } from 'react-bootstrap';
import { rendezVousAPI, userAPI, patientsAPI } from '../../Services/api';

const RendezVousInfirmier = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState({}); // Cache des patients
  const [medecins, setMedecins] = useState({}); // Cache des médecins
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingMedecins, setLoadingMedecins] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  // Charger toutes les données nécessaires
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Charger en parallèle les rendez-vous, patients et médecins
      await Promise.all([
        loadRendezVous(),
        loadAllPatients(),
        loadAllMedecins()
      ]);
      
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadRendezVous = async () => {
    try {
      const response = await rendezVousAPI.getRendezVous();
      
      let rendezVousList = [];
      
      // Gérer différentes structures de réponse
      if (response.data && Array.isArray(response.data)) {
        rendezVousList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        rendezVousList = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        rendezVousList = response.data.data;
      } else if (Array.isArray(response)) {
        rendezVousList = response;
      }
      
      setRendezVous(rendezVousList);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des rendez-vous';
      setError(`Erreur: ${errorMessage}`);
      setRendezVous([]);
    }
  };

  // Charger tous les patients et créer un cache
  const loadAllPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientsAPI.getAllPatients();
      
      let patientsList = [];
      
      if (response.data && Array.isArray(response.data)) {
        patientsList = response.data;
      } else if (Array.isArray(response)) {
        patientsList = response;
      } else if (response.data && typeof response.data === 'object') {
        patientsList = [response.data];
      }
      
      // Créer un cache pour les patients
      const patientCache = {};
      patientsList.forEach(patient => {
        if (!patient) return;
        
        const patientId = patient.id_patient || patient.id;
        if (!patientId) return;
        
        let patientInfo = {};
        
        if (patient.user) {
          // Structure avec relation user
          patientInfo = {
            id_patient: patientId,
            CIN: patient.CIN || patient.user.CIN,
            nom: patient.user.nom,
            prenom: patient.user.prenom,
            email: patient.user.email,
            num_tel: patient.user.num_tel
          };
        } else if (patient.nom) {
          // Structure plate
          patientInfo = {
            id_patient: patientId,
            CIN: patient.CIN,
            nom: patient.nom,
            prenom: patient.prenom,
            email: patient.email,
            num_tel: patient.num_tel
          };
        } else {
          // Structure minimale
          patientInfo = {
            id_patient: patientId,
            CIN: patient.CIN || 'N/A',
            nom: 'Patient',
            prenom: `#${patientId}`,
            email: 'N/A',
            num_tel: 'N/A'
          };
        }
        
        patientCache[patientId] = patientInfo;
      });
      
      setPatients(patientCache);
      
    } catch (err) {
      console.error('Erreur chargement patients:', err);
      setPatients({});
    } finally {
      setLoadingPatients(false);
    }
  };

  // Charger tous les médecins et créer un cache
  const loadAllMedecins = async () => {
    try {
      setLoadingMedecins(true);
      const response = await userAPI.getAllMedecins();
      
      let medecinsList = [];
      
      if (response.data && Array.isArray(response.data)) {
        medecinsList = response.data;
      } else if (Array.isArray(response)) {
        medecinsList = response;
      }
      
      // Créer un cache pour les médecins
      const medecinCache = {};
      medecinsList.forEach(medecin => {
        if (!medecin) return;
        
        const medecinId = medecin.id_medecin || medecin.id;
        if (!medecinId) return;
        
        let medecinInfo = {};
        
        if (medecin.user) {
          // Structure avec relation user
          medecinInfo = {
            id_medecin: medecinId,
            CIN: medecin.CIN || medecin.user.CIN,
            nom: medecin.user.nom,
            prenom: medecin.user.prenom,
            specialite: medecin.specialite || 'Généraliste',
            description: medecin.description || ''
          };
        } else if (medecin.nom) {
          // Structure plate
          medecinInfo = {
            id_medecin: medecinId,
            CIN: medecin.CIN,
            nom: medecin.nom,
            prenom: medecin.prenom,
            specialite: medecin.specialite || 'Généraliste',
            description: medecin.description || ''
          };
        } else {
          // Structure minimale
          medecinInfo = {
            id_medecin: medecinId,
            CIN: medecin.CIN || 'N/A',
            nom: 'Médecin',
            prenom: `#${medecinId}`,
            specialite: medecin.specialite || 'Généraliste',
            description: ''
          };
        }
        
        medecinCache[medecinId] = medecinInfo;
      });
      
      setMedecins(medecinCache);
      
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
      setMedecins({});
    } finally {
      setLoadingMedecins(false);
    }
  };

  // Obtenir les informations d'un patient
  const getPatientInfo = (patientId) => {
    if (!patientId) {
      return {
        nomComplet: 'Non spécifié',
        CIN: 'N/A',
        display: 'Patient non spécifié'
      };
    }
    
    // Chercher dans le cache
    if (patients[patientId]) {
      const p = patients[patientId];
      return {
        nomComplet: `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Nom inconnu',
        CIN: p.CIN || 'N/A',
        display: `${p.prenom || ''} ${p.nom || ''}`.trim() || `Patient #${patientId}`
      };
    }
    
    // Si non trouvé dans le cache
    return {
      nomComplet: `Patient #${patientId}`,
      CIN: 'Non trouvé',
      display: `Patient #${patientId}`
    };
  };

  // Obtenir les informations d'un médecin
  const getMedecinInfo = (medecinId) => {
    if (!medecinId) {
      return {
        nomComplet: 'Non spécifié',
        specialite: 'N/A',
        display: 'Médecin non spécifié'
      };
    }
    
    // Chercher dans le cache
    if (medecins[medecinId]) {
      const m = medecins[medecinId];
      return {
        nomComplet: `${m.prenom || ''} ${m.nom || ''}`.trim() || 'Nom inconnu',
        specialite: m.specialite || 'Généraliste',
        display: `${m.prenom || ''} ${m.nom || ''}`.trim() || `Médecin #${medecinId}`
      };
    }
    
    // Si non trouvé dans le cache
    return {
      nomComplet: `Médecin #${medecinId}`,
      specialite: 'Non trouvée',
      display: `Médecin #${medecinId}`
    };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'prévu': 'warning',
      'confirmé': 'info',
      'terminé': 'success',
      'annulé': 'danger',
      'planifié': 'warning'
    };
    return statusConfig[status?.toLowerCase()] || 'secondary';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'prévu': 'Prévu',
      'confirmé': 'Confirmé',
      'terminé': 'Terminé',
      'annulé': 'Annulé',
      'planifié': 'Planifié'
    };
    return statusTexts[status?.toLowerCase()] || status || 'Inconnu';
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
    } catch {
      return 'Date invalide';
    }
  };

  const handleReload = () => {
    setError('');
    loadAllData();
  };

  if (loading && rendezVous.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des rendez-vous...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1>Rendez-vous Médicaux</h1>
        <p className="text-muted">Vue infirmier - Consultation des rendez-vous</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" size="sm" onClick={handleReload}>
            Réessayer
          </Button>
        </Alert>
      )}

      {(loadingPatients || loadingMedecins) && (
        <Alert variant="info" className="mb-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Chargement des informations patients et médecins...
        </Alert>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>
            Liste des Rendez-vous
          </h5>
          <div>
            <Button 
              variant="outline-primary" 
              onClick={handleReload} 
              className="me-2"
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Actualiser
            </Button>
            <Badge bg="primary" className="fs-6">
              {rendezVous.length} rendez-vous
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {rendezVous.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun rendez-vous trouvé</h5>
              <p className="text-muted">
                {error ? 'Erreur de chargement des données' : 'Aucun rendez-vous programmé'}
              </p>
              {!error && (
                <Button variant="primary" onClick={handleReload}>
                  <i className="fas fa-sync-alt me-2"></i>
                  Actualiser
                </Button>
              )}
            </div>
          ) : (
            <Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Patient</th>
                  <th>Médecin</th>
                  <th>Date et Heure</th>
                  <th>Statut</th>
                  <th>Motif</th>
                </tr>
              </thead>
              <tbody>
                {rendezVous.map((rdv) => {
                  const patientInfo = getPatientInfo(rdv.id_patient);
                  const medecinInfo = getMedecinInfo(rdv.id_medecin);
                  
                  return (
                    <tr key={rdv.id || rdv.idR || rdv.id_rv}>
                      <td>
                        <strong>{patientInfo.nomComplet}</strong>
                      </td>
                      <td>
                        <strong>{medecinInfo.nomComplet}</strong>
                      </td>
                      <td>
                        <div>{formatDate(rdv.date_heure || rdv.date_rv)}</div>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(rdv.statut)}>
                          {getStatusText(rdv.statut)}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '150px' }} title={rdv.motif}>
                          {rdv.motif || 'Non spécifié'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RendezVousInfirmier;