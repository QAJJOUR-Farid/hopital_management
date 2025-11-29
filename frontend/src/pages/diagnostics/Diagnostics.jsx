import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Alert, 
  Spinner, 
  Card, 
  Badge, 
  Modal, 
  Form,
  Row,
  Col 
} from 'react-bootstrap';
import { diagnosticsAPI, userAPI } from '../../Services/api';

const Diagnostics = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiagnostic, setEditingDiagnostic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [medecinsCache, setMedecinsCache] = useState({});
  const [patientsCache, setPatientsCache] = useState({});
  const [loadingMedecins, setLoadingMedecins] = useState({});
  const [loadingPatients, setLoadingPatients] = useState({});
  const [formData, setFormData] = useState({
    id_patient: '',
    id_medecin: '',
    dateD: new Date().toISOString().split('T')[0],
    description: '',
    resultats: '',
    etat: 'enAttente'
  });

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await diagnosticsAPI.getDiagnostics();
      console.log('Diagnostics chargés:', response.data);
      setDiagnostics(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des diagnostics';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger un médecin individuellement avec gestion du cache
  const loadMedecin = useCallback(async (medecinId) => {
    if (!medecinId || medecinsCache[medecinId] || loadingMedecins[medecinId]) {
      return;
    }

    try {
      setLoadingMedecins(prev => ({ ...prev, [medecinId]: true }));
      const response = await userAPI.getMedecinById(medecinId);
      setMedecinsCache(prev => ({
        ...prev,
        [medecinId]: response.data
      }));
    } catch (err) {
      console.error(`Erreur lors du chargement du médecin ${medecinId}:`, err);
      setMedecinsCache(prev => ({
        ...prev,
        [medecinId]: { error: true, id: medecinId }
      }));
    } finally {
      setLoadingMedecins(prev => ({ ...prev, [medecinId]: false }));
    }
  }, [medecinsCache, loadingMedecins]);

  // Charger un patient individuellement avec gestion du cache
  const loadPatient = useCallback(async (patientId) => {
    if (!patientId || patientsCache[patientId] || loadingPatients[patientId]) {
      return;
    }

    try {
      setLoadingPatients(prev => ({ ...prev, [patientId]: true }));
      const response = await userAPI.getPatientById(patientId);
      setPatientsCache(prev => ({
        ...prev,
        [patientId]: response.data
      }));
    } catch (err) {
      console.error(`Erreur lors du chargement du patient ${patientId}:`, err);
      setPatientsCache(prev => ({
        ...prev,
        [patientId]: { error: true, id: patientId }
      }));
    } finally {
      setLoadingPatients(prev => ({ ...prev, [patientId]: false }));
    }
  }, [patientsCache, loadingPatients]);

  // Charger les données manquantes pour un diagnostic spécifique
  const loadMissingDataForDiagnostic = useCallback((diagnostic) => {
    if (diagnostic.id_medecin && !medecinsCache[diagnostic.id_medecin] && !loadingMedecins[diagnostic.id_medecin]) {
      loadMedecin(diagnostic.id_medecin);
    }
    
    if (diagnostic.id_patient && !patientsCache[diagnostic.id_patient] && !loadingPatients[diagnostic.id_patient]) {
      loadPatient(diagnostic.id_patient);
    }
  }, [medecinsCache, patientsCache, loadingMedecins, loadingPatients, loadMedecin, loadPatient]);

  // Charger les données pour tous les diagnostics visibles
  useEffect(() => {
    diagnostics.forEach(diagnostic => {
      loadMissingDataForDiagnostic(diagnostic);
    });
  }, [diagnostics, loadMissingDataForDiagnostic]);

  // Fonction pour obtenir l'ID du diagnostic de manière fiable
  const getDiagnosticId = (diagnostic) => {
    return diagnostic.idD || diagnostic.id || diagnostic.id_diagnostic;
  };

  const handleShowModal = (diagnostic = null) => {
    if (diagnostic) {
      // Mode édition - charger les données si manquantes
      loadMissingDataForDiagnostic(diagnostic);
      
      setEditingDiagnostic(diagnostic);
      setFormData({
        id_patient: diagnostic.id_patient || '',
        id_medecin: diagnostic.id_medecin || '',
        dateD: diagnostic.dateD
          ? new Date(diagnostic.dateD).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        description: diagnostic.description || '',
        resultats: diagnostic.resultats || '',
        etat: diagnostic.etat || 'enAttente'
      });
    } else {
      // Mode création
      setEditingDiagnostic(null);
      setFormData({
        id_patient: '',
        id_medecin: '',
        dateD: new Date().toISOString().split('T')[0],
        description: '',
        resultats: '',
        etat: 'enAttente'
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDiagnostic(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.id_patient || formData.id_patient.trim() === '') {
      errors.push('Patient ID est requis');
    } else if (isNaN(formData.id_patient) || parseInt(formData.id_patient) <= 0) {
      errors.push('Patient ID doit être un nombre valide positif');
    }

    if (!formData.id_medecin || formData.id_medecin.trim() === '') {
      errors.push('Médecin ID est requis');
    } else if (isNaN(formData.id_medecin) || parseInt(formData.id_medecin) <= 0) {
      errors.push('Médecin ID doit être un nombre valide positif');
    }

    if (!formData.dateD) {
      errors.push('Date du diagnostic est requise');
    } else {
      const selectedDate = new Date(formData.dateD);
      const today = new Date();
      if (selectedDate > today) {
        errors.push('La date du diagnostic ne peut pas être dans le futur');
      }
    }

    if (!formData.description || formData.description.trim() === '') {
      errors.push('Description est requise');
    } else if (formData.description.trim().length < 5) {
      errors.push('Description doit contenir au moins 5 caractères');
    }

    return errors;
  };

  const handleSubmitDiagnostic = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Préparer les données pour l'API
      const apiData = {
        id_patient: parseInt(formData.id_patient),
        id_medecin: parseInt(formData.id_medecin),
        dateD: formData.dateD,
        description: formData.description.trim(),
        resultats: formData.resultats?.trim() || '',
        etat: editingDiagnostic ? formData.etat : 'enAttente'
      };

      console.log('Données envoyées à l\'API:', apiData);

      if (editingDiagnostic) {
        // Mode édition
        const diagnosticId = getDiagnosticId(editingDiagnostic);
        if (!diagnosticId) {
          setError('ID du diagnostic manquant pour la modification');
          return;
        }
        
        await diagnosticsAPI.updateDiagnostic(diagnosticId, apiData);
        alert('Diagnostic modifié avec succès!');
      } else {
        // Mode création
        await diagnosticsAPI.createDiagnostic(apiData);
        alert('Diagnostic créé avec succès!');
      }
      
      // Recharger la liste et vider le cache pour recharger les nouvelles données
      setMedecinsCache({});
      setPatientsCache({});
      await loadDiagnostics();
      handleCloseModal();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.errors || 
                         err.message || 
                         `Erreur lors de ${editingDiagnostic ? 'la modification' : 'la création'} du diagnostic`;
      setError(errorMessage);
      console.error('Erreur détaillée:', err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiagnostic = async (diagnostic) => {
    const diagnosticId = getDiagnosticId(diagnostic);
    
    if (!diagnosticId) {
      setError('ID du diagnostic manquant pour la suppression');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce diagnostic ? Cette action est irréversible.')) {
      try {
        await diagnosticsAPI.deleteDiagnostic(diagnosticId);
        setDiagnostics(prev => prev.filter(diag => getDiagnosticId(diag) !== diagnosticId));
        
        // Nettoyer le cache si nécessaire
        const { id_medecin, id_patient } = diagnostic;
        const shouldRemoveMedecin = !diagnostics.some(d => d.id_medecin === id_medecin && getDiagnosticId(d) !== diagnosticId);
        const shouldRemovePatient = !diagnostics.some(d => d.id_patient === id_patient && getDiagnosticId(d) !== diagnosticId);
        
        if (shouldRemoveMedecin) {
          setMedecinsCache(prev => {
            const newCache = { ...prev };
            delete newCache[id_medecin];
            return newCache;
          });
        }
        
        if (shouldRemovePatient) {
          setPatientsCache(prev => {
            const newCache = { ...prev };
            delete newCache[id_patient];
            return newCache;
          });
        }
        
        alert('Diagnostic supprimé avec succès');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
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

  // Fonction pour obtenir le nom du patient (avec bouton de rechargement si erreur)
  const getPatientName = (diagnostic) => {
    const patientId = diagnostic.id_patient;
    if (!patientId) return 'N/A';
    
    const patient = patientsCache[patientId];
    
    if (loadingPatients[patientId]) {
      return <Spinner animation="border" size="sm" />;
    }
    
    if (patient && patient.error) {
      return (
        <div className="d-flex align-items-center">
          <span className="text-danger me-2">Patient #{patientId}</span>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => loadPatient(patientId)}
            title="Recharger"
          >
            <i className="fas fa-redo"></i>
          </Button>
        </div>
      );
    }
    
    if (patient && patient.user) {
      return getFullName(patient.user);
    }
    
    // Si pas encore chargé, déclencher le chargement
    if (!patient && !loadingPatients[patientId]) {
      setTimeout(() => loadPatient(patientId), 0);
    }
    
    return `Patient #${patientId}`;
  };

  // Fonction pour obtenir le nom du médecin (avec bouton de rechargement si erreur)
  const getMedecinName = (diagnostic) => {
    const medecinId = diagnostic.id_medecin;
    if (!medecinId) return 'N/A';
    
    const medecin = medecinsCache[medecinId];
    
    if (loadingMedecins[medecinId]) {
      return <Spinner animation="border" size="sm" />;
    }
    
    if (medecin && medecin.error) {
      return (
        <div className="d-flex align-items-center">
          <span className="text-danger me-2">Médecin #{medecinId}</span>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => loadMedecin(medecinId)}
            title="Recharger"
          >
            <i className="fas fa-redo"></i>
          </Button>
        </div>
      );
    }
    
    if (medecin && medecin.user) {
      return `Dr. ${getFullName(medecin.user)}`;
    }
    
    // Si pas encore chargé, déclencher le chargement
    if (!medecin && !loadingMedecins[medecinId]) {
      setTimeout(() => loadMedecin(medecinId), 0);
    }
    
    return `Médecin #${medecinId}`;
  };

  // Fonction pour obtenir le CIN du patient
  const getPatientCIN = (diagnostic) => {
    const patientId = diagnostic.id_patient;
    if (!patientId) return 'N/A';
    const patient = patientsCache[patientId];
    if (patient && !patient.error && patient.CIN) {
      return patient.CIN;
    }
    return 'N/A';
  };

  // Fonction pour obtenir le CIN du médecin
  const getMedecinCIN = (diagnostic) => {
    const medecinId = diagnostic.id_medecin;
    if (!medecinId) return 'N/A';
    const medecin = medecinsCache[medecinId];
    if (medecin && !medecin.error && medecin.CIN) {
      return medecin.CIN;
    }
    return 'N/A';
  };

  // Fonction pour générer une clé unique
  const getUniqueKey = (diagnostic, index) => {
    const diagnosticId = getDiagnosticId(diagnostic);
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

  const getModalTitle = () => {
    return editingDiagnostic ? 'Modifier le Diagnostic' : 'Nouveau Diagnostic';
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
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>
          Nouveau Diagnostic
        </Button>
      </div>

      {error && !showModal && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

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
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-info">
                <i className="fas fa-user-injured"></i>
              </div>
              <div className="stats-number">
                {Object.keys(patientsCache).filter(id => !patientsCache[id]?.error).length}
              </div>
              <div className="stats-label">Patients Chargés</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stats-number">
                {Object.keys(medecinsCache).filter(id => !medecinsCache[id]?.error).length}
              </div>
              <div className="stats-label">Médecins Chargés</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>CIN Patient</th>
            <th>Médecin</th>
            <th>CIN Médecin</th>
            <th>Date</th>
            <th>Description</th>
            <th>Résultats</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((diagnostic, index) => {
            const diagnosticId = getDiagnosticId(diagnostic);
            return (
              <tr key={getUniqueKey(diagnostic, index)}>
                <td>#{diagnosticId || 'N/A'}</td>
                <td>
                  <strong>{getPatientName(diagnostic)}</strong>
                  <br />
                  <small className="text-muted">ID: {diagnostic.id_patient || 'N/A'}</small>
                </td>
                <td>
                  {getPatientCIN(diagnostic)}
                </td>
                <td>
                  <strong>{getMedecinName(diagnostic)}</strong>
                  <br />
                  <small className="text-muted">ID: {diagnostic.id_medecin || 'N/A'}</small>
                </td>
                <td>
                  {getMedecinCIN(diagnostic)}
                </td>
                <td>{formatDate(diagnostic.dateD)}</td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '150px' }} title={diagnostic.description}>
                    {diagnostic.description || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '150px' }} title={diagnostic.resultats}>
                    {diagnostic.resultats || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  {getEtatBadge(diagnostic.etat)}
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowModal(diagnostic)}
                      title="Modifier"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteDiagnostic(diagnostic)}
                      title="Supprimer"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
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
          <p className="text-muted">Commencez par créer un nouveau diagnostic.</p>
        </div>
      )}

      {/* Modal pour ajouter/modifier un diagnostic */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitDiagnostic}>
          <Modal.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient ID *</Form.Label>
                  <Form.Control
                    type="number"
                    name="id_patient"
                    value={formData.id_patient}
                    onChange={handleInputChange}
                    placeholder="ID du patient"
                    required
                    min="1"
                    disabled={submitting}
                  />
                  <Form.Text className="text-muted">
                    Identifiant numérique du patient (doit exister dans la base)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin ID *</Form.Label>
                  <Form.Control
                    type="number"
                    name="id_medecin"
                    value={formData.id_medecin}
                    onChange={handleInputChange}
                    placeholder="ID du médecin"
                    required
                    min="1"
                    disabled={submitting}
                  />
                  <Form.Text className="text-muted">
                    Identifiant numérique du médecin (doit exister dans la base)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date du Diagnostic *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateD"
                    value={formData.dateD}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>État</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.etat}
                    readOnly
                    disabled
                  />
                  <Form.Text className="text-muted">
                    {editingDiagnostic 
                      ? "L'état ne peut pas être modifié" 
                      : "Les nouveaux diagnostics sont toujours en attente"}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description détaillée du diagnostic..."
                required
                disabled={submitting}
                minLength={5}
              />
              <Form.Text className="text-muted">
                Minimum 5 caractères
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Résultats</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="resultats"
                value={formData.resultats}
                onChange={handleInputChange}
                placeholder="Résultats des examens, observations..."
                disabled={submitting}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {editingDiagnostic ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <i className={`fas ${editingDiagnostic ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {editingDiagnostic ? 'Modifier le Diagnostic' : 'Créer le Diagnostic'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Diagnostics;