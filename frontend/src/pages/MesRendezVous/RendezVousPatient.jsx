import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { rendezVousAPI, userAPI } from '../../Services/api';

const RendezVousPatient = () => {
  const [state, setState] = useState({
    rendezVous: [],
    filteredRendezVous: [],
    loading: true,
    error: '',
    success: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ statut: '', date: '', search: '' });
  const [formData, setFormData] = useState({
    medecin_cin: '', date_rv: '', heure_rv: '09:00:00', motif: ''
  });
  const [data, setData] = useState({
    medecins: [], 
    medecinsDetails: [], 
    currentPatient: null, 
    loadingData: true
  });

  const setStateValue = (key, value) => setState(prev => ({ ...prev, [key]: value }));
  const setDataValue = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  // Configuration des statuts
  const statusConfig = {
    'prévu': { badge: 'warning', text: 'Prévu' },
    'confirmé': { badge: 'info', text: 'Confirmé' },
    'terminé': { badge: 'success', text: 'Terminé' },
    'annulé': { badge: 'danger', text: 'Annulé' }
  };

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const extractData = (response) => {
    return Array.isArray(response.data) ? response.data : 
           response.data?.data || response.data?.success?.data || [];
  };

  // Charger le patient connecté - MODIFIER CETTE FONCTION SELON VOTRE AUTH
  const loadCurrentPatient = useCallback(async () => {
    try {
      // ESSAYEZ D'ABORD DE RÉCUPÉRER LE PATIENT CONNECTÉ
      // Si vous avez un système d'authentification, utilisez-le ici
      
      // Sinon, essayez de charger depuis l'API
      const response = await userAPI.getAllUsers();
      const usersData = extractData(response);
      
      // Chercher un utilisateur avec le rôle patient
      const patientUser = usersData.find(user => user.role === 'patient');
      
      if (patientUser) {
        const patient = {
          id_patient: patientUser.id || 1, // Adaptez selon votre structure
          CIN: patientUser.CIN || 'P12345',
          nom: patientUser.nom || 'patient 1',
          prenom: patientUser.prenom || ''
        };
        setDataValue('currentPatient', patient);
        return patient;
      } else {
        // Fallback : patient par défaut
        const patient = {
          id_patient: 1,
          CIN: 'P12345',
          nom: 'patient 1',
          prenom: ''
        };
        setDataValue('currentPatient', patient);
        return patient;
      }
    } catch (err) {
      console.error('Erreur chargement patient:', err);
      // Fallback en cas d'erreur
      const patient = {
        id_patient: 1,
        CIN: 'P12345',
        nom: 'patient 1',
        prenom: ''
      };
      setDataValue('currentPatient', patient);
      return patient;
    }
  }, []);

  // Chargement des données
 const loadRendezVous = useCallback(async (patient) => {
  try {
    setStateValue('loading', true);
    const response = await rendezVousAPI.getRendezVous();
    const rendezVousData = extractData(response);

    // Filtrer pour n'afficher que les rendez-vous du patient connecté
    const patientRendezVous = rendezVousData.filter(rdv => 
      rdv.id_patient == patient?.id_patient
    );

    setStateValue('rendezVous', patientRendezVous);
    setStateValue('error', '');
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des rendez-vous';
    setStateValue('error', `Erreur: ${errorMessage}`);
  } finally {
    setStateValue('loading', false);
  }
}, []);


  const loadMedecinsData = async () => {
    try {
      const response = await userAPI.getAllUsers();
      const usersData = extractData(response);
      
      const medecinsData = usersData.filter(user => user.role === 'medecin');
      setDataValue('medecins', medecinsData);
      console.log('Médecins chargés:', medecinsData.length); // DEBUG
    } catch (err) {
      setStateValue('error', 'Erreur lors du chargement des médecins: ' + err.message);
      console.error('Erreur loadMedecinsData:', err); // DEBUG
    }
  };

  const loadMedecinsDetails = async () => {
    try {
      const response = await userAPI.getAllMedecins();
      const details = extractData(response);
      setDataValue('medecinsDetails', details);
      console.log('Détails médecins chargés:', details.length); // DEBUG
    } catch (err) {
      setStateValue('error', 'Erreur lors du chargement des détails médecins: ' + err.message);
      console.error('Erreur loadMedecinsDetails:', err); // DEBUG
    }
  };

 const loadInitialData = async () => {
  try {
    setDataValue('loadingData', true);

    // 1. Charger d'abord le patient
    const patient = await loadCurrentPatient();

    // 2. Charger les rendez-vous et les médecins en parallèle
    await Promise.all([
      loadRendezVous(patient),
      loadMedecinsData(),
      loadMedecinsDetails()
    ]);

  } catch (err) {
    setStateValue('error', 'Erreur lors du chargement des données: ' + err.message);
    console.error('Erreur loadInitialData:', err);
  } finally {
    setDataValue('loadingData', false);
  }
};

  // Filtres
  const applyFilters = useCallback(() => {
    let filtered = [...state.rendezVous];

    if (filters.statut) filtered = filtered.filter(rdv => rdv.statut === filters.statut);
    
    if (filters.date) {
      filtered = filtered.filter(rdv => {
        if (!rdv.date_rv) return false;
        return new Date(rdv.date_rv).toISOString().split('T')[0] === filters.date;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(rdv => {
        const medecin = getMedecinInfo(rdv.id_medecin);
        return (
          (medecin?.nom || '').toLowerCase().includes(searchLower) ||
          (medecin?.prenom || '').toLowerCase().includes(searchLower) ||
          (rdv.motif || '').toLowerCase().includes(searchLower)
        );
      });
    }

    setStateValue('filteredRendezVous', filtered);
  }, [state.rendezVous, filters]);

  // Gestion des formulaires
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitRendezVous = async (e) => {
    e.preventDefault();
    
    try {
      setStateValue('loading', true);
      
      if (!formData.medecin_cin || !formData.date_rv || !formData.motif) {
        setStateValue('error', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Récupérer les détails du médecin à partir de CIN
      const medecinDetail = data.medecinsDetails.find(m => m.CIN === formData.medecin_cin);

      if (!medecinDetail) {
        setStateValue('error', 'Médecin non trouvé');
        return;
      }

      const rendezVousData = {
        id_patient: data.currentPatient.id_patient,
        id_medecin: medecinDetail.id_medecin, // Utiliser l'ID du médecin
        date_rv: `${formData.date_rv} ${formData.heure_rv}`,
        motif: formData.motif,
        statut: 'prévu',
        // Ne pas inclure id_rec ou le mettre à null si ce n'est pas requis
        id_rec: null  // <--- Modification clé : id_rec est null
      };

      console.log('Création RDV:', rendezVousData); // DEBUG
      await rendezVousAPI.createRendezVous(rendezVousData);
      
      setStateValue('success', 'Rendez-vous créé avec succès!');
      setShowModal(false);
      setFormData({ medecin_cin: '', date_rv: '', heure_rv: '09:00:00', motif: '' });
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création';
      console.error("Erreur détaillée:", err); // Log l'erreur pour le débogage
      setStateValue('error', `Erreur: ${errorMessage}`);
      console.error('Erreur création RDV:', err); // DEBUG
    } finally {
      setStateValue('loading', false);
    }
  };

  const handleAnnulerRendezVous = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) {
      try {
        await rendezVousAPI.updateRendezVous(id, { statut: 'annulé' });
        setStateValue('success', 'Rendez-vous annulé avec succès!');
        loadRendezVous();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de l\'annulation';
        setStateValue('error', `Erreur: ${errorMessage}`);
      }
    }
  };

  // Récupération des informations
  const getMedecinInfo = (medecinId) => {
    const medecinDetail = data.medecinsDetails.find(m => m.id_medecin === medecinId);
    const medecinUser = data.medecins.find(m => m.CIN === medecinDetail?.CIN);

    if (!medecinDetail && !medecinUser) return null;

    return {
      ...medecinUser,
      ...medecinDetail
    };
  };

  // Effects
  useEffect(() => { 
    console.log('Initial load...'); // DEBUG
    loadInitialData(); 
  }, []);

  useEffect(() => { 
    console.log('Application des filtres...'); // DEBUG
    applyFilters(); 
  }, [applyFilters]);

  const { loading, error, success, filteredRendezVous, rendezVous } = state;
  const { medecins, currentPatient, loadingData } = data;

  const stats = {
    total: rendezVous.length,
    planned: rendezVous.filter(rdv => rdv.statut === 'prévu').length,
    confirmed: rendezVous.filter(rdv => rdv.statut === 'confirmé').length,
    completed: rendezVous.filter(rdv => rdv.statut === 'terminé').length
  };

  if ((loading && rendezVous.length === 0) || loadingData) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" className="mb-3" />
          <p>Chargement des données...</p>
        </div>
      </Container>
    );
  }

  console.log('Render - Rendez-vous:', rendezVous.length); // DEBUG
  console.log('Render - Filtérés:', filteredRendezVous.length); // DEBUG

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Mes Rendez-vous</h1>
          <p className="text-muted">
            {currentPatient ? `Patient: ${currentPatient.nom} ${currentPatient.prenom}` : 'Gestion de vos rendez-vous'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>Prendre Rendez-vous
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setStateValue('error', '')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setStateValue('success', '')}>{success}</Alert>}

      {/* Statistiques */}
      <Row className="mb-4">
        {[
          { key: 'total', icon: 'fa-calendar-alt', color: 'primary', label: 'Total RDV' },
          { key: 'planned', icon: 'fa-clock', color: 'warning', label: 'Prévus' },
          { key: 'confirmed', icon: 'fa-check-circle', color: 'info', label: 'Confirmés' },
          { key: 'completed', icon: 'fa-check-double', color: 'success', label: 'Terminés' }
        ].map(({ key, icon, color, label }) => (
          <Col md={3} key={key}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <div className={`text-${color} mb-2`}><i className={`fas ${icon} fa-2x`}></i></div>
                <h4 className={`text-${color}`}>{stats[key]}</h4>
                <p className="text-muted mb-0">{label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filtres */}
      <Card className="modern-card mb-4">
        <Card.Header><h5 className="mb-0"><i className="fas fa-filter me-2"></i>Filtres</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select value={filters.statut} onChange={(e) => handleFilterChange('statut', e.target.value)}>
                  <option value="">Tous les statuts</option>
                  {Object.keys(statusConfig).map(status => (
                    <option key={status} value={status}>{statusConfig[status].text}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Recherche</Form.Label>
                <Form.Control type="text" placeholder="Médecin ou motif..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Button variant="outline-secondary" onClick={() => setFilters({ statut: '', date: '', search: '' })}>
                <i className="fas fa-times me-2"></i>Réinitialiser les filtres
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tableau */}
      <Card className="modern-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="fas fa-list me-2"></i>Mes Rendez-vous</h5>
          <Badge bg="primary">{filteredRendezVous.length} rendez-vous</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0 modern-table">
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Date et Heure</th>
                <th>Statut</th>
                <th>Motif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRendezVous.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <i className="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                    <p className="text-muted">Aucun rendez-vous trouvé</p>
                    <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                      <i className="fas fa-plus me-2"></i>Prendre un rendez-vous
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredRendezVous.map((rdv) => {
                  const medecin = getMedecinInfo(rdv.id_medecin);
                  const status = statusConfig[rdv.statut] || {};
                  
                  const med = getMedecinInfo(rdv.id_medecin);

                  return (
                    <tr key={rdv.idR}>
                      <td>
                        <strong>Dr. {medecin?.nom || 'N/A'} {medecin?.prenom || ''}</strong>
                      </td>
                      <td>
                        {med?.specialite || "Non spécifié"}
                      </td>
                      <td>{medecin?.specialite || "Non spécifié"}</td>
                      <td className="text-nowrap">{formatDate(rdv.date_rv)}</td>
                      <td><Badge bg={status.badge}>{status.text}</Badge></td>
                      <td><small className="text-muted">{rdv.motif || 'Non spécifié'}</small></td>
                      <td>
                        <div className="btn-group">
                          {rdv.statut === 'prévu' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              title="Annuler le rendez-vous"
                              onClick={() => handleAnnulerRendezVous(rdv.idR)}
                            >
                              <i className="fas fa-times"></i> Annuler
                            </Button>
                          )}
                          {(rdv.statut === 'confirmé' || rdv.statut === 'terminé') && (
                            <small className="text-muted">Aucune action</small>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de prise de rendez-vous */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-calendar-plus me-2"></i>Prendre un Rendez-vous</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitRendezVous}>
          <Modal.Body>
            {currentPatient && (
              <Alert variant="info" className="mb-3">
                <i className="fas fa-user me-2"></i>
                <strong>CIN:</strong>  
                {currentPatient.CIN && ` ${currentPatient.CIN}`}
              </Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin *</Form.Label>
                  <Form.Select name="medecin_cin" value={formData.medecin_cin} onChange={handleFormChange} required>
                    <option value="">Sélectionnez un médecin</option>
                    {data.medecins.map(medecin => (
                      <option key={medecin.CIN} value={medecin.CIN}>
                        Dr. {medecin.nom} {medecin.prenom} - {medecin.specialite}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date du rendez-vous *</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="date_rv" 
                    value={formData.date_rv} 
                    onChange={handleFormChange} 
                    required 
                    min={new Date().toISOString().split('T')[0]} 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure *</Form.Label>
                  <Form.Select name="heure_rv" value={formData.heure_rv} onChange={handleFormChange} required>
                    {['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00'].map(heure => (
                      <option key={heure} value={heure}>{heure.split(':')[0]}h{heure.split(':')[1]}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Control 
                    type="text" 
                    value="Prévu (en attente de confirmation)" 
                    disabled 
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Le rendez-vous sera confirmé par la réception
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Motif de la consultation *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="motif"
                placeholder="Décrivez le motif de votre consultation..."
                value={formData.motif}
                onChange={handleFormChange}
                required
              />
              <Form.Text className="text-muted">
                Décrivez brièvement la raison de votre visite
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={state.loading || !data.medecins.length}>
              {state.loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Création...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Confirmer le Rendez-vous
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default RendezVousPatient;