import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Button,
  Alert,
  Spinner,
  Card,
  Badge,
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import { diagnosticsAPI, patientsAPI, userAPI } from '../../Services/api'; // Ajout de patientsAPI
import { useAuth } from '../../hooks/useAuth';

const DiagnosticsMedecin = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentMedecinId, setCurrentMedecinId] = useState(null);
  const [patientData, setPatientData] = useState({});
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    if (user && user.CIN) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    if (currentMedecinId) {
      loadDiagnostics();
    }
  }, [currentMedecinId]);

  // Charger toutes les données nécessaires
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Charger le médecin actuel
      await loadCurrentMedecin();

      // 2. Charger tous les patients (pour avoir les noms)
      await loadAllPatients();

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données initiales');
    } finally {
      setLoading(false);
    }
  };

  // Charger le médecin actuel
  const loadCurrentMedecin = async () => {
    if (!user || !user.CIN) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      console.log('Chargement du médecin pour CIN:', user.CIN);
      
      // Option 1: Si l'utilisateur a déjà l'ID du médecin
      if (user.id_medecin) {
        setCurrentMedecinId(user.id_medecin);
        return;
      }

      // Option 2: Chercher parmi tous les médecins
      const response = await userAPI.getAllMedecins();
      console.log('Liste des médecins:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Chercher le médecin par CIN
        const medecin = response.data.find(m => m.CIN === user.CIN);
        
        if (medecin) {
          console.log('Médecin trouvé:', medecin);
          setCurrentMedecinId(medecin.id_medecin);
          
          // Mettre à jour l'ID dans l'objet user si nécessaire
          if (!user.id_medecin && medecin.id_medecin) {
            user.id_medecin = medecin.id_medecin;
          }
        } else {
          // Si pas trouvé, peut-être que user.CIN est un user ID
          const medecinById = response.data.find(m => m.id == user.CIN);
          if (medecinById) {
            console.log('Médecin trouvé par ID:', medecinById);
            setCurrentMedecinId(medecinById.id_medecin);
          } else {
            setError('Vous n\'êtes pas enregistré comme médecin');
          }
        }
      } else {
        setError('Format de données des médecins incorrect');
      }
    } catch (err) {
      console.error('Erreur API médecins:', err);
      setError('Erreur lors du chargement des informations médecin');
    }
  };

  // Charger tous les patients
  const loadAllPatients = async () => {
    try {
      console.log('Chargement des patients...');
      const response = await patientsAPI.getAllPatients(); // Utilisation de patientsAPI
      console.log('Réponse patients:', response);
      
      let patientsList = [];
      
      // Gérer différentes structures de réponse
      if (response.data && Array.isArray(response.data)) {
        patientsList = response.data;
      } else if (Array.isArray(response)) {
        patientsList = response;
      } else if (response.data && typeof response.data === 'object') {
        // Si c'est un objet avec une propriété data
        patientsList = [response.data];
      } else {
        console.warn('Format de réponse patient inattendu:', response);
        patientsList = [];
      }
      
      console.log('Liste patients traitée:', patientsList);
      setAllPatients(patientsList);
      
      // Créer un map de données patient
      const patientMap = {};
      patientsList.forEach(patient => {
        if (!patient) return;
        
        // Extraire les informations patient
        let patientInfo = {};
        const patientId = patient.id_patient || patient.id;
        
        if (!patientId) {
          console.warn('Patient sans ID:', patient);
          return;
        }
        
        if (patient.user) {
          // Structure avec relation user
          patientInfo = {
            id_patient: patientId,
            CIN: patient.CIN || patient.user.CIN,
            nom: patient.user.nom,
            prenom: patient.user.prenom,
            email: patient.user.email,
            num_tel: patient.user.num_tel,
            adresse: patient.user.adresse
          };
        } else if (patient.nom) {
          // Structure plate
          patientInfo = {
            id_patient: patientId,
            CIN: patient.CIN,
            nom: patient.nom,
            prenom: patient.prenom,
            email: patient.email,
            num_tel: patient.num_tel,
            adresse: patient.adresse
          };
        } else {
          // Structure minimale
          patientInfo = {
            id_patient: patientId,
            CIN: patient.CIN || 'N/A',
            nom: 'Patient',
            prenom: `#${patientId}`,
            email: 'N/A',
            num_tel: 'N/A',
            adresse: 'N/A'
          };
        }
        
        patientMap[patientId] = patientInfo;
      });
      
      console.log('Patient map créé:', patientMap);
      setPatientData(patientMap);
      
    } catch (err) {
      console.error('Erreur lors du chargement des patients:', err);
      console.error('Détails erreur:', err.response || err.message);
      // Ne pas bloquer le chargement principal si les patients échouent
      setAllPatients([]);
      setPatientData({});
    }
  };

  // Charger les diagnostics
  const loadDiagnostics = async () => {
    if (!currentMedecinId) {
      setError('Médecin non identifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Chargement des diagnostics pour médecin ID:', currentMedecinId);
      
      const response = await diagnosticsAPI.getDiagnostics();
      console.log('Réponse complète diagnostics:', response);
      
      let diagnosticsList = [];
      
      // Vérifier la structure de la réponse
      if (response.data && Array.isArray(response.data)) {
        diagnosticsList = response.data;
      } else if (Array.isArray(response)) {
        diagnosticsList = response;
      } else if (response.data && typeof response.data === 'object') {
        // Si c'est un objet avec une propriété data qui est un tableau
        diagnosticsList = Array.isArray(response.data.data) ? response.data.data : [response.data];
      } else {
        console.error('Format de réponse inattendu:', response);
        throw new Error('Format de données incorrect');
      }
      
      console.log('Liste diagnostics:', diagnosticsList);
      
      // Filtrer pour ne montrer que les diagnostics du médecin connecté
      const medecinDiagnostics = diagnosticsList.filter(
        diagnostic => diagnostic.id_medecin == currentMedecinId
      );
      
      console.log('Diagnostics filtrés pour médecin:', medecinDiagnostics);
      setDiagnostics(medecinDiagnostics);
      
    } catch (err) {
      console.error('Erreur détaillée lors du chargement des diagnostics:', err);
      
      let errorMessage = 'Erreur lors du chargement des diagnostics';
      
      if (err.response) {
        console.log('Status:', err.response.status);
        console.log('Data:', err.response.data);
        
        if (err.response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (err.response.status === 404) {
          errorMessage = 'Service non trouvé. Vérifiez la configuration.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion.';
      } else {
        errorMessage = err.message || 'Erreur inattendue';
      }
      
      setError(errorMessage);
      setDiagnostics([]);
    } finally {
      setLoading(false);
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
    if (patientData[patientId]) {
      const p = patientData[patientId];
      return {
        nomComplet: `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Nom inconnu',
        CIN: p.CIN || 'N/A',
        display: `${p.prenom || ''} ${p.nom || ''}`.trim() || `Patient #${patientId}`
      };
    }
    
    // Chercher dans la liste des patients
    const patient = allPatients.find(p => {
      const id = p.id_patient || p.id;
      return id == patientId || (p.user && p.user.id == patientId);
    });
    
    if (patient) {
      let nomComplet = '';
      let CIN = '';
      
      if (patient.user) {
        nomComplet = `${patient.user.prenom || ''} ${patient.user.nom || ''}`.trim();
        CIN = patient.user.CIN || patient.CIN || 'N/A';
      } else if (patient.nom) {
        nomComplet = `${patient.prenom || ''} ${patient.nom || ''}`.trim();
        CIN = patient.CIN || 'N/A';
      } else {
        nomComplet = `Patient #${patientId}`;
        CIN = patient.CIN || 'N/A';
      }
      
      return {
        nomComplet: nomComplet || `Patient #${patientId}`,
        CIN: CIN,
        display: nomComplet || `Patient #${patientId}`
      };
    }
    
    // Patient non trouvé - essayer d'obtenir les infos via API si possible
    return {
      nomComplet: `Patient #${patientId}`,
      CIN: 'Non trouvé',
      display: `Patient #${patientId}`
    };
  };

  // Gérer l'affichage du modal de détails
  const handleShowDetailModal = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setShowDetailModal(true);
    setError('');
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDiagnostic(null);
    setError('');
  };

  // Approuver un diagnostic
  const handleApproveDiagnostic = async (diagnostic) => {
    const diagnosticId = getDiagnosticId(diagnostic);

    if (!diagnosticId) {
      setError('ID du diagnostic manquant');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir approuver ce diagnostic ?')) {
      try {
        setSubmitting(true);
        setError('');

        const updateData = {
          ...diagnostic,
          etat: 'approuver'
        };

        console.log('Envoi de l\'approbation pour diagnostic:', diagnosticId);
        await diagnosticsAPI.updateDiagnostic(diagnosticId, updateData);

        // Mettre à jour localement
        setDiagnostics(prev => prev.map(d =>
          getDiagnosticId(d) === diagnosticId ? { ...d, etat: 'approuver' } : d
        ));

        alert('Diagnostic approuvé avec succès!');
        handleCloseDetailModal();

      } catch (err) {
        console.error('Erreur lors de l\'approbation:', err);
        const errorMessage = err.response?.data?.message || 'Erreur lors de l\'approbation du diagnostic';
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Refuser un diagnostic
  const handleRejectDiagnostic = async (diagnostic) => {
    const diagnosticId = getDiagnosticId(diagnostic);

    if (!diagnosticId) {
      setError('ID du diagnostic manquant');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir refuser ce diagnostic ?')) {
      try {
        setSubmitting(true);
        setError('');

        const updateData = {
          ...diagnostic,
          etat: 'refusé'
        };

        await diagnosticsAPI.updateDiagnostic(diagnosticId, updateData);

        // Mettre à jour localement
        setDiagnostics(prev => prev.map(d =>
          getDiagnosticId(d) === diagnosticId ? { ...d, etat: 'refusé' } : d
        ));

        alert('Diagnostic refusé avec succès!');
        handleCloseDetailModal();

      } catch (err) {
        console.error('Erreur lors du refus:', err);
        const errorMessage = err.response?.data?.message || 'Erreur lors du refus du diagnostic';
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Obtenir l'ID d'un diagnostic
  const getDiagnosticId = (diagnostic) => {
    return diagnostic.idD || diagnostic.id || diagnostic.id_diagnostic;
  };

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Obtenir le badge d'état
  const getEtatBadge = (etat) => {
    if (!etat) return <Badge bg="secondary">Inconnu</Badge>;
    
    const etatLower = etat.toLowerCase();
    
    if (etatLower.includes('approu')) {
      return <Badge bg="success">Approuvé</Badge>;
    } else if (etatLower.includes('attente') || etatLower.includes('pending')) {
      return <Badge bg="warning">En attente</Badge>;
    } else if (etatLower.includes('refus')) {
      return <Badge bg="danger">Refusé</Badge>;
    } else {
      return <Badge bg="light" text="dark">{etat}</Badge>;
    }
  };

  // Vérifier si on peut approuver/refuser
  const canApproveReject = (diagnostic) => {
    if (!diagnostic || !diagnostic.etat) return false;
    const etat = diagnostic.etat.toLowerCase();
    return etat.includes('attente') || etat.includes('pending');
  };

  // Recharger les données
  const handleReload = () => {
    setError('');
    if (currentMedecinId) {
      loadDiagnostics();
    } else {
      loadAllData();
    }
  };

  // Afficher le chargement
  if (loading && diagnostics.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Chargement des données...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Mes Diagnostics</h1>
          <p className="text-muted mb-0">Gestion de vos diagnostics médicaux</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={handleReload}
          disabled={loading || submitting}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex align-items-center">
            <i className="fas fa-exclamation-circle me-2"></i>
            <div>
              <strong>Erreur:</strong> {error}
            </div>
          </div>
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={handleReload}>
              Réessayer
            </Button>
          </div>
        </Alert>
      )}

      {/* Statistiques */}
      {diagnostics.length > 0 && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-0">{diagnostics.length}</h3>
                <small className="text-muted">Total</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-0 text-warning">
                  {diagnostics.filter(d => canApproveReject(d)).length}
                </h3>
                <small className="text-muted">En attente</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-0 text-success">
                  {diagnostics.filter(d => d.etat?.toLowerCase().includes('approu')).length}
                </h3>
                <small className="text-muted">Approuvés</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-0 text-danger">
                  {diagnostics.filter(d => d.etat?.toLowerCase().includes('refus')).length}
                </h3>
                <small className="text-muted">Refusés</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tableau des diagnostics */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">
            <i className="fas fa-file-medical me-2"></i>
            Liste des diagnostics
          </h5>
        </Card.Header>
        <Card.Body>
          {diagnostics.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-stethoscope fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun diagnostic trouvé</h5>
              <p className="text-muted mb-4">
                {error ? 'Erreur lors du chargement' : 'Vous n\'avez aucun diagnostic assigné.'}
              </p>
              <Button variant="primary" onClick={handleReload}>
                <i className="fas fa-sync-alt me-2"></i>
                {error ? 'Réessayer' : 'Actualiser'}
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>CIN</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>État</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostics.map((diagnostic, index) => {
                    const patientInfo = getPatientInfo(diagnostic.id_patient);
                    
                    return (
                      <tr key={`diagnostic-${index}-${diagnostic.id_patient || index}`}>
                        <td>
                          <div className="fw-medium">{patientInfo.display}</div>
                        </td>
                        <td>
                          <Badge bg="info" className="fw-normal">
                            {patientInfo.CIN}
                          </Badge>
                        </td>
                        <td>{formatDate(diagnostic.dateD)}</td>
                        <td>
                          <div 
                            className="text-truncate" 
                            style={{ maxWidth: '200px' }}
                            title={diagnostic.description}
                          >
                            {diagnostic.description || 'Non spécifié'}
                          </div>
                        </td>
                        <td>
                          {getEtatBadge(diagnostic.etat)}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleShowDetailModal(diagnostic)}
                              title="Voir détails"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            
                            {canApproveReject(diagnostic) && (
                              <>
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleApproveDiagnostic(diagnostic)}
                                  title="Approuver"
                                  disabled={submitting}
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleRejectDiagnostic(diagnostic)}
                                  title="Refuser"
                                  disabled={submitting}
                                >
                                  <i className="fas fa-times"></i>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de détails */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-file-medical-alt me-2"></i>
            Détails du diagnostic
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDiagnostic && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Informations du diagnostic</h6>
                  <div className="mb-2">
                    <strong>ID:</strong> #{getDiagnosticId(selectedDiagnostic)}
                  </div>
                  <div className="mb-2">
                    <strong>Date:</strong> {formatDate(selectedDiagnostic.dateD)}
                  </div>
                  <div>
                    <strong>État:</strong> {getEtatBadge(selectedDiagnostic.etat)}
                  </div>
                </Col>
                <Col md={6}>
                  <h6>Informations du patient</h6>
                  {(() => {
                    const patientInfo = getPatientInfo(selectedDiagnostic.id_patient);
                    return (
                      <>
                        <div className="mb-2">
                          <strong>Nom:</strong> {patientInfo.nomComplet}
                        </div>
                        <div className="mb-2">
                          <strong>CIN:</strong> {patientInfo.CIN}
                        </div>
                        <div>
                          <strong>ID Patient:</strong> {selectedDiagnostic.id_patient}
                        </div>
                      </>
                    );
                  })()}
                </Col>
              </Row>

              <hr />

              <div className="mb-4">
                <h6>Description</h6>
                <div className="p-3 bg-light rounded">
                  {selectedDiagnostic.description || 'Non spécifié'}
                </div>
              </div>

              <div className="mb-4">
                <h6>Résultats</h6>
                <div className="p-3 bg-light rounded">
                  {selectedDiagnostic.resultats || 'Non spécifié'}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedDiagnostic && canApproveReject(selectedDiagnostic) && (
            <>
              <Button 
                variant="success" 
                onClick={() => handleApproveDiagnostic(selectedDiagnostic)}
                disabled={submitting}
              >
                <i className="fas fa-check me-2"></i>
                Approuver
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleRejectDiagnostic(selectedDiagnostic)}
                disabled={submitting}
              >
                <i className="fas fa-times me-2"></i>
                Refuser
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DiagnosticsMedecin;