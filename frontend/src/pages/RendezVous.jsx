import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { rendezVousAPI } from '../Services/api';

const RendezVous = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [filteredRendezVous, setFilteredRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    statut: '',
    date: '',
    search: ''
  });

  // États pour le formulaire
  const [formData, setFormData] = useState({
    id_medecin: '',
    date_rv: '',
    motif: ''
  });

  // États pour les listes de sélection
  const [medecins, setMedecins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadRendezVous();
    loadCurrentUser();
    loadMedecins();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rendezVous, filters]);

  const loadRendezVous = async () => {
    try {
      setLoading(true);
      const response = await rendezVousAPI.getRendezVous();
      console.log('Rendez-vous chargés:', response.data);
      setRendezVous(response.data);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des rendez-vous';
      setError(`Erreur: ${errorMessage}`);
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  // Simuler le chargement de l'utilisateur connecté
  const loadCurrentUser = () => {
    // En production, vous récupéreriez ça depuis votre contexte d'authentification
    const user = {
      id_patient: 1, // À remplacer par l'ID réel du patient connecté
      nom: 'Jean Dupont',
      type: 'patient'
    };
    setCurrentUser(user);
  };

  // Charger la liste des médecins
  const loadMedecins = async () => {
    try {
      // Simuler le chargement des médecins - à remplacer par votre API réelle
      const medecinsList = [
        { id_medecin: 1, nom: 'Dr. Martin', specialite: 'Généraliste' },
        { id_medecin: 2, nom: 'Dr. Bernard', specialite: 'Cardiologue' },
        { id_medecin: 3, nom: 'Dr. Sophie', specialite: 'Pédiatre' },
        { id_medecin: 4, nom: 'Dr. Laurent', specialite: 'Dermatologue' }
      ];
      setMedecins(medecinsList);
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...rendezVous];

    if (filters.statut) {
      filtered = filtered.filter(rdv => rdv.statut === filters.statut);
    }

    if (filters.date) {
      filtered = filtered.filter(rdv => {
        if (!rdv.date_rv) return false;
        const rdvDate = new Date(rdv.date_rv).toISOString().split('T')[0];
        return rdvDate === filters.date;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(rdv =>
        (rdv.patient?.nom || '').toLowerCase().includes(searchLower) ||
        (rdv.medecin?.nom || '').toLowerCase().includes(searchLower) ||
        (rdv.motif || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredRendezVous(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitRendezVous = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Vous devez être connecté pour prendre un rendez-vous');
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données avec l'ID patient automatique
      const rendezVousData = {
        id_patient: currentUser.id_patient, // ID automatique du patient connecté
        id_medecin: parseInt(formData.id_medecin),
        id_rec: 1, // ID réceptionniste par défaut ou selon votre logique
        date_rv: formData.date_rv + ' 09:00:00', // Ajouter l'heure par défaut
        motif: formData.motif,
        statut: 'prévu'
      };

      console.log('Envoi des données:', rendezVousData);
      const response = await rendezVousAPI.createRendezVous(rendezVousData);
      console.log('Réponse API:', response.data);
      
      setSuccess('Rendez-vous créé avec succès!');
      setShowModal(false);
      setFormData({
        id_medecin: '',
        date_rv: '',
        motif: ''
      });
      
      // Recharger la liste
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la création du rendez-vous';
      setError(`Erreur: ${errorMessage}`);
      console.error('Erreur détaillée création:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRendezVous = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
      try {
        await rendezVousAPI.deleteRendezVous(id);
        setSuccess('Rendez-vous supprimé avec succès!');
        loadRendezVous();
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la suppression du rendez-vous';
        setError(`Erreur: ${errorMessage}`);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await rendezVousAPI.updateRendezVous(id, { statut: newStatus });
      setSuccess('Statut mis à jour avec succès!');
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du statut';
      setError(`Erreur: ${errorMessage}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'prévu': 'warning',
      'confirmé': 'info',
      'terminé': 'success',
      'annulé': 'danger'
    };
    return statusConfig[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'prévu': 'Prévu',
      'confirmé': 'Confirmé',
      'terminé': 'Terminé',
      'annulé': 'Annulé'
    };
    return statusTexts[status] || status;
  };

  const getStatusActions = (rdv) => {
    // Seul le patient propriétaire peut modifier/supprimer ses rendez-vous
    const isOwner = currentUser && currentUser.id_patient === rdv.id_patient;
    
    if (!isOwner) return null;

    switch (rdv.statut) {
      case 'prévu':
        return (
          <>
            <Button 
              variant="outline-success" 
              size="sm" 
              title="Confirmer"
              onClick={() => handleUpdateStatus(rdv.idR, 'confirmé')}
            >
              <i className="fas fa-check"></i>
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              title="Annuler"
              onClick={() => handleUpdateStatus(rdv.idR, 'annulé')}
            >
              <i className="fas fa-times"></i>
            </Button>
          </>
        );
      case 'confirmé':
        return (
          <Button 
            variant="outline-success" 
            size="sm" 
            title="Marquer comme terminé"
            onClick={() => handleUpdateStatus(rdv.idR, 'terminé')}
          >
            <i className="fas fa-check-double"></i>
          </Button>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: rendezVous.length,
    planned: rendezVous.filter(rdv => rdv.statut === 'prévu').length,
    confirmed: rendezVous.filter(rdv => rdv.statut === 'confirmé').length,
    completed: rendezVous.filter(rdv => rdv.statut === 'terminé').length
  };

  // Filtrer les rendez-vous pour n'afficher que ceux du patient connecté
  // const patientRendezVous = currentUser 
  //   ? rendezVous.filter(rdv => rdv.id_patient === currentUser.id_patient)
  //   : [];

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
      {/* En-tête avec bouton */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Mes Rendez-vous</h1>
          <p className="text-muted">
            {currentUser ? `Bienvenue ${currentUser.nom}` : 'Gérez vos rendez-vous'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Prendre Rendez-vous
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <strong>Erreur:</strong> {error}
        </Alert>
      )}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body className="text-center">
              <div className="stats-icon text-primary">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Total RDV</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body className="text-center">
              <div className="stats-icon text-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">{stats.planned}</div>
              <div className="stats-label">Prévus</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body className="text-center">
              <div className="stats-icon text-info">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stats-number">{stats.confirmed}</div>
              <div className="stats-label">Confirmés</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card modern-card">
            <Card.Body className="text-center">
              <div className="stats-icon text-success">
                <i className="fas fa-check-double"></i>
              </div>
              <div className="stats-number">{stats.completed}</div>
              <div className="stats-label">Terminés</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="mb-4 modern-card">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Filtres
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={filters.statut}
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="prévu">Prévu</option>
                  <option value="confirmé">Confirmé</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulé">Annulé</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Recherche</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par médecin ou motif..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({ statut: '', date: '', search: '' })}
                className="w-100"
              >
                <i className="fas fa-times me-2"></i>
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tableau des rendez-vous */}
      <Card className="modern-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Mes Rendez-vous</h5>
          <Badge bg="primary">{filteredRendezVous.length} rendez-vous</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0 modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Médecin</th>
                <th>Date</th>
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
                  </td>
                </tr>
              ) : (
                filteredRendezVous.map((rdv) => (
                  <tr key={rdv.idR}>
                    <td>#{rdv.idR}</td>
                    <td>
                      <strong>{rdv.medecin?.nom || `Médecin ${rdv.id_medecin}`}</strong>
                      {rdv.medecin?.specialite && (
                        <div>
                          <small className="text-muted">{rdv.medecin.specialite}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      {rdv.date_rv ? 
                        new Date(rdv.date_rv).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'
                      }
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
                      <div className="btn-group" role="group">
                        {getStatusActions(rdv)}
                        {currentUser && currentUser.id_patient === rdv.id_patient && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            title="Supprimer"
                            onClick={() => handleDeleteRendezVous(rdv.idR)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de prise de rendez-vous */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-calendar-plus me-2"></i>
            Prendre un Rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitRendezVous}>
          <Modal.Body>
            {currentUser && (
              <Alert variant="info" className="mb-3">
                <i className="fas fa-user me-2"></i>
                <strong>Patient:</strong> {currentUser.nom} (ID: {currentUser.id_patient})
              </Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin *</Form.Label>
                  <Form.Select
                    name="id_medecin"
                    value={formData.id_medecin}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Sélectionnez un médecin</option>
                    {medecins.map(medecin => (
                      <option key={medecin.id_medecin} value={medecin.id_medecin}>
                        {medecin.nom} - {medecin.specialite}
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
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
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

export default RendezVous;