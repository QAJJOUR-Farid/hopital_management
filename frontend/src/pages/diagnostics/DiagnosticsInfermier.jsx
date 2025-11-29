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
  Form,
  Row,
  Col 
} from 'react-bootstrap';
import { diagnosticsAPI, userAPI } from '../../Services/api';

const DiagnosticsInfermier = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiagnostic, setEditingDiagnostic] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [allPatients, setAllPatients] = useState([]);
  const [allMedecins, setAllMedecins] = useState([]);
  const [loadingAllPatients, setLoadingAllPatients] = useState(false);
  const [loadingAllMedecins, setLoadingAllMedecins] = useState(false);
  const [formData, setFormData] = useState({
    patientCIN: '',
    medecinCIN: '',
    dateD: new Date().toISOString().split('T')[0],
    description: '',
    resultats: '',
    etat: 'enAttente'
  });

  useEffect(() => {
    loadDiagnostics();
    loadAllPatients();
    loadAllMedecins();
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

  const loadAllPatients = async () => {
    try {
      setLoadingAllPatients(true);
      const response = await userAPI.getAllUsers();
      // Filter only patients
      const patients = response.data.filter(user => user.role === 'patient');
      setAllPatients(patients);
    } catch (err) {
      console.error('Erreur chargement patients:', err);
    } finally {
      setLoadingAllPatients(false);
    }
  };

  const loadAllMedecins = async () => {
    try {
      setLoadingAllMedecins(true);
      const response = await userAPI.getAllUsers();
      // Filter only medecins
      const medecins = response.data.filter(user => user.role === 'medecin');
      setAllMedecins(medecins);
    } catch (err) {
      console.error('Erreur chargement medecins:', err);
    } finally {
      setLoadingAllMedecins(false);
    }
  };



  // Fonction pour obtenir l'ID du diagnostic de manière fiable
  const getDiagnosticId = (diagnostic) => {
    return diagnostic.idD || diagnostic.id || diagnostic.id_diagnostic;
  };

  const handleShowModal = (diagnostic = null) => {
    if (diagnostic) {
      // Mode édition
      setEditingDiagnostic(diagnostic);
      setFormData({
        patientCIN: diagnostic.patient?.user?.CIN || '',
        medecinCIN: diagnostic.medecin?.user?.CIN || '',
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
        patientCIN: '',
        medecinCIN: '',
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

    if (!formData.patientCIN || String(formData.patientCIN).trim() === '') {
      errors.push('Patient est requis');
    }

    if (!formData.medecinCIN || String(formData.medecinCIN).trim() === '') {
      errors.push('Médecin est requis');
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

      // Convertir les CINs en IDs
      const selectedPatient = allPatients.find(p => p.CIN === formData.patientCIN);
      const selectedMedecin = allMedecins.find(m => m.CIN === formData.medecinCIN);

      if (!selectedPatient) {
        setError('Patient non trouvé');
        return;
      }

      if (!selectedMedecin) {
        setError('Médecin non trouvé');
        return;
      }

      // Préparer les données pour l'API
      const apiData = {
        id_patient: selectedPatient.patient?.id_patient,
        id_medecin: selectedMedecin.medecins?.id_medecin,
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
      
      // Recharger la liste
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

  // Fonction pour obtenir le nom du patient
  const getPatientName = (diagnostic) => {
    if (diagnostic.patient && diagnostic.patient.user) {
      return getFullName(diagnostic.patient.user);
    }
    return 'N/A';
  };

  // Fonction pour obtenir le nom du médecin
  const getMedecinName = (diagnostic) => {
    if (diagnostic.medecin && diagnostic.medecin.user) {
      return `Dr. ${getFullName(diagnostic.medecin.user)}`;
    }
    return 'N/A';
  };

  // Fonction pour obtenir le CIN du patient
  const getPatientCIN = (diagnostic) => {
    if (diagnostic.patient && diagnostic.patient.user && diagnostic.patient.user.CIN) {
      return diagnostic.patient.user.CIN;
    }
    return 'N/A';
  };

  // Fonction pour obtenir le CIN du médecin
  const getMedecinCIN = (diagnostic) => {
    if (diagnostic.medecin && diagnostic.medecin.user && diagnostic.medecin.user.CIN) {
      return diagnostic.medecin.user.CIN;
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
                {diagnostics.filter(d => d.patient && d.patient.user).length}
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
                {diagnostics.filter(d => d.medecin && d.medecin.user).length}
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
                  <Form.Label>Patient *</Form.Label>
                  <Form.Select
                    name="patientCIN"
                    value={formData.patientCIN}
                    onChange={handleInputChange}
                    required
                    disabled={submitting || loadingAllPatients}
                  >
                    <option value="">Sélectionner un patient</option>
                    {allPatients.map(patient => (
                      <option key={patient.CIN} value={patient.CIN}>
                        {getFullName(patient)} - {patient.CIN}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Sélectionner le patient dans la liste
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin *</Form.Label>
                  <Form.Select
                    name="medecinCIN"
                    value={formData.medecinCIN}
                    onChange={handleInputChange}
                    required
                    disabled={submitting || loadingAllMedecins}
                  >
                    <option value="">Sélectionner un médecin</option>
                    {allMedecins.map(medecin => (
                      <option key={medecin.CIN} value={medecin.CIN}>
                        Dr. {getFullName(medecin)} - {medecin.CIN}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Sélectionner le médecin dans la liste
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

export default DiagnosticsInfermier;
