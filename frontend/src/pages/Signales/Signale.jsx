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
  Col,
  Tabs,
  Tab
} from 'react-bootstrap';
import { signaleAPI, produitsAPI, userAPI } from '../../Services/api';
import { useAuth } from '../../hooks/useAuth'; // Pour récupérer l'infirmier connecté

const Signale = () => {
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSignale, setEditingSignale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentInfirmierId, setCurrentInfirmierId] = useState(null);
  
  // Listes pour les selects
  const [produits, setProduits] = useState([]);
  const [magasiniers, setMagasiniers] = useState([]);
  const [loadingProduits, setLoadingProduits] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'repture',
    descriptionS: '',
    nbProduit: '',
    idP: '',
    id_magasinier: '',
    id_infirmier: ''
  });

  useEffect(() => {
    loadSignalements();
    loadCurrentInfirmierInfo();
  }, []);

  const loadSignalements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await signaleAPI.getSignalements();
      console.log('Signalements chargés:', response.data);
      // S'assurer que c'est un tableau
      const data = Array.isArray(response.data) ? response.data : [];
      setSignalements(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des signalements';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les infos de l'infirmier connecté
  const loadCurrentInfirmierInfo = async () => {
    if (!user?.CIN) {
      console.error('❌ Aucun CIN trouvé dans user');
      return;
    }

    try {
      console.log('🔍 Chargement infirmier pour CIN:', user.CIN);
      const response = await userAPI.getUserByCIN(user.CIN);
      console.log('📋 Réponse getUserByCIN:', response.data);
      
      // Vérifier différentes structures possibles
      const infirmierId = response.data?.infirmiers?.id_infirmier || 
                         response.data?.infirmier?.id_infirmier ||
                         response.data?.id_infirmier;
      
      if (infirmierId) {
        console.log('✅ ID infirmier trouvé:', infirmierId);
        setCurrentInfirmierId(infirmierId);
        setFormData(prev => ({
          ...prev,
          id_infirmier: infirmierId
        }));
      } else {
        console.error('❌ Aucun ID infirmier trouvé dans la réponse');
      }
    } catch (err) {
      console.error('❌ Erreur chargement infirmier:', err);
    }
  };

  // Charger tous les produits
  const loadAllProduits = async () => {
    if (produits.length > 0) return;
    
    try {
      setLoadingProduits(true);
      const response = await produitsAPI.getProduits();
      console.log('Produits chargés:', response.data);
      setProduits(response.data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoadingProduits(false);
    }
  };

  // Charger tous les magasiniers
  const loadAllMagasiniers = async () => {
    if (magasiniers.length > 0) return;
    
    try {
      setLoadingMagasiniers(true);
      const response = await userAPI.getAllMagasiniers();
      console.log('Magasiniers chargés:', response.data);
      setMagasiniers(response.data);
    } catch (err) {
      console.error('Erreur chargement magasiniers:', err);
    } finally {
      setLoadingMagasiniers(false);
    }
  };

  // Mettre à jour l'ID infirmier quand il est chargé
  useEffect(() => {
    if (currentInfirmierId) {
      setFormData(prev => ({
        ...prev,
        id_infirmier: currentInfirmierId
      }));
    }
  }, [currentInfirmierId]);

  const handleShowModal = async (signale = null) => {
    // Charger les listes pour les selects
    await Promise.all([
      loadAllProduits(),
      loadAllMagasiniers()
    ]);
    
    if (signale) {
      setEditingSignale(signale);
      setFormData({
        type: signale.type || 'repture',
        descriptionS: signale.descriptionS || '',
        nbProduit: signale.nbProduit || '',
        idP: signale.idP || '',
        id_magasinier: signale.id_magasinier || '',
        id_infirmier: currentInfirmierId || signale.id_infirmier || ''
      });
    } else {
      setEditingSignale(null);
      setFormData({
        type: 'repture',
        descriptionS: '',
        nbProduit: '',
        idP: '',
        id_magasinier: '',
        id_infirmier: currentInfirmierId || ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSignale(null);
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
    
    console.log('🔍 Validation du formulaire:', formData);
    
    if (!formData.type) {
      errors.push('Type de signalement requis');
    }
    
    if (!formData.descriptionS || formData.descriptionS.trim() === '') {
      errors.push('Description requise');
    } else if (formData.descriptionS.trim().length < 10) {
      errors.push('Description doit contenir au moins 10 caractères');
    }
    
    if (!formData.idP || formData.idP === '') {
      errors.push('Veuillez sélectionner un produit');
    }
    
    if (!formData.id_magasinier || formData.id_magasinier === '') {
      errors.push('Veuillez sélectionner un magasinier');
    }
    
    if (!formData.id_infirmier || formData.id_infirmier === '') {
      errors.push('ID infirmier manquant. Veuillez vous reconnecter.');
      console.error('❌ ID infirmier manquant. User:', user);
    }
    
    if (formData.type === 'repture' && (!formData.nbProduit || formData.nbProduit <= 0)) {
      errors.push('Quantité affectée requise pour une rupture');
    }
    
    console.log('✅ Erreurs de validation:', errors);
    return errors;
  };

  const handleSubmitSignale = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const apiData = {
        type: formData.type,
        descriptionS: formData.descriptionS.trim(),
        idP: parseInt(formData.idP),
        id_magasinier: parseInt(formData.id_magasinier),
        id_infirmier: parseInt(formData.id_infirmier)
      };

      // Ajouter nbProduit seulement si type est 'repture' et qu'il a une valeur
      if (formData.type === 'repture' && formData.nbProduit) {
        apiData.nbProduit = parseInt(formData.nbProduit);
      }

      console.log('Données envoyées:', apiData);

      if (editingSignale) {
        const signaleId = editingSignale.idS || editingSignale.id;
        if (!signaleId) {
          setError('ID du signalement manquant');
          return;
        }
        
        await signaleAPI.updateSignale(signaleId, apiData);
        alert('Signalement modifié avec succès!');
      } else {
        await signaleAPI.createSignale(apiData);
        alert('Signalement créé avec succès!');
      }
      
      await loadSignalements();
      handleCloseModal();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error ||
                         JSON.stringify(err.response?.data?.errors) ||
                         err.message || 
                         `Erreur lors de ${editingSignale ? 'la modification' : 'la création'}`;
      setError(errorMessage);
      console.error('Erreur détaillée:', err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSignale = async (signale) => {
    const signaleId = signale.idS || signale.id;
    
    if (!signaleId) {
      setError('ID du signalement manquant');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      try {
        await signaleAPI.deleteSignale(signaleId);
        setSignalements(prev => prev.filter(s => (s.idS || s.id) !== signaleId));
        alert('Signalement supprimé avec succès');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getFullName = (user) => {
    if (!user) return '';
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  };

  const getProduitName = (idP) => {
    const produit = produits.find(p => p.idP === idP);
    return produit ? produit.nom : `Produit #${idP}`;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'repture':
        return <Badge bg="danger">Rupture</Badge>;
      case 'malfonctionnement':
        return <Badge bg="warning" text="dark">Dysfonctionnement</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const getStatutBadge = (statut) => {
    if (!statut) return <Badge bg="secondary">Non défini</Badge>;
    
    switch (statut) {
      case 'en_attente':
      case 'en attente':
        return <Badge bg="warning">En attente</Badge>;
      case 'en_cours':
      case 'en cours':
        return <Badge bg="info">En cours</Badge>;
      case 'resolu':
      case 'résolu':
        return <Badge bg="success">Résolu</Badge>;
      case 'rejete':
      case 'rejeté':
        return <Badge bg="danger">Rejeté</Badge>;
      default:
        return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  const getUniqueKey = (signale, index) => {
    const signaleId = signale.idS || signale.id;
    return signaleId || `signale-${index}-${Date.now()}`;
  };

  // Statistiques
  const stats = {
    total: signalements.length,
    ruptures: signalements.filter(s => s.type === 'repture').length,
    dysfonctionnements: signalements.filter(s => s.type === 'malfonctionnement').length,
    enAttente: signalements.filter(s => s.statut === 'en_attente' || s.statut === 'en attente').length,
    resolus: signalements.filter(s => s.statut === 'resolu' || s.statut === 'résolu').length
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
        <h1>Gestion des Signalements</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          Nouveau Signalement
        </Button>
      </div>

      {error && !showModal && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-2">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Total</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-2">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-danger">
                <i className="fas fa-box-open"></i>
              </div>
              <div className="stats-number">{stats.ruptures}</div>
              <div className="stats-label">Ruptures</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-2">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning">
                <i className="fas fa-tools"></i>
              </div>
              <div className="stats-number">{stats.dysfonctionnements}</div>
              <div className="stats-label">Dysfonctionnements</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-info">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">{stats.enAttente}</div>
              <div className="stats-label">En attente</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stats-number">{stats.resolus}</div>
              <div className="stats-label">Résolus</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tableau des signalements */}
      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Description</th>
            <th>Infirmier</th>
            <th>Magasinier</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {signalements.map((signale, index) => {
            const signaleId = signale.idS || signale.id;
            return (
              <tr key={getUniqueKey(signale, index)}>
                <td>#{signaleId || 'N/A'}</td>
                <td>{getTypeBadge(signale.type)}</td>
                <td>
                  <strong>{getProduitName(signale.idP)}</strong>
                  <br />
                  <small className="text-muted">ID: {signale.idP}</small>
                </td>
                <td>{signale.nbProduit || 'N/A'}</td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '200px' }} title={signale.descriptionS}>
                    {signale.descriptionS || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  <small className="text-muted">ID: {signale.id_infirmier || 'N/A'}</small>
                </td>
                <td>
                  <small className="text-muted">ID: {signale.id_magasinier || 'N/A'}</small>
                </td>
                <td>{formatDate(signale.dateS || signale.created_at)}</td>
                <td>{signale.statut ? getStatutBadge(signale.statut) : <Badge bg="secondary">Non défini</Badge>}</td>
                <td>
                  <div className="btn-group" role="group">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowModal(signale)}
                      title="Modifier"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteSignale(signale)}
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

      {signalements.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun signalement trouvé</h4>
          <p className="text-muted">Commencez par créer un nouveau signalement.</p>
        </div>
      )}

      {/* Modal pour ajouter/modifier */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSignale ? 'Modifier le Signalement' : 'Nouveau Signalement'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitSignale}>
          <Modal.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de signalement *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="repture">Rupture de stock</option>
                    <option value="malfonctionnement">Dysfonctionnement</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Produit concerné *</Form.Label>
                  {loadingProduits ? (
                    <div className="text-center p-2">
                      <Spinner animation="border" size="sm" /> Chargement...
                    </div>
                  ) : (
                    <Form.Select
                      name="idP"
                      value={formData.idP}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Sélectionner un produit --</option>
                      {produits.map(produit => (
                        <option key={produit.idP} value={produit.idP}>
                          {produit.nom} (Stock: {produit.nombre || 0})
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Quantité affectée {formData.type === 'repture' && '*'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="nbProduit"
                    value={formData.nbProduit}
                    onChange={handleInputChange}
                    placeholder="Nombre d'unités"
                    required={formData.type === 'repture'}
                    disabled={submitting}
                    min="1"
                  />
                  <Form.Text className="text-muted">
                    {formData.type === 'repture' 
                      ? 'Requis pour les ruptures de stock' 
                      : 'Optionnel pour les dysfonctionnements'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Magasinier responsable *</Form.Label>
                  {loadingMagasiniers ? (
                    <div className="text-center p-2">
                      <Spinner animation="border" size="sm" /> Chargement...
                    </div>
                  ) : (
                    <Form.Select
                      name="id_magasinier"
                      value={formData.id_magasinier}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Sélectionner un magasinier --</option>
                      {magasiniers.map(magasinier => (
                        <option key={magasinier.id_magasinier} value={magasinier.id_magasinier}>
                          {magasinier.user ? getFullName(magasinier.user) : 'Nom inconnu'} - {magasinier.CIN}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  <Form.Text className="text-muted">
                    Magasinier qui sera notifié de ce signalement
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Champ caché pour l'ID infirmier */}
            <input type="hidden" name="id_infirmier" value={formData.id_infirmier} />
            
            {currentInfirmierId ? (
              <Alert variant="info" className="mb-3">
                <small>
                  <i className="fas fa-info-circle me-2"></i>
                  Signalement effectué par : <strong>{getFullName(user)}</strong> (ID: {currentInfirmierId})
                </small>
              </Alert>
            ) : (
              <Alert variant="warning" className="mb-3">
                <small>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Chargement de vos informations...</strong>
                  <br />
                  Si ce message persiste, vous devez être connecté en tant qu'infirmier.
                </small>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description du problème *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="descriptionS"
                value={formData.descriptionS}
                onChange={handleInputChange}
                placeholder="Décrivez en détail le problème rencontré..."
                required
                disabled={submitting}
                minLength={10}
              />
              <Form.Text className="text-muted">
                Minimum 10 caractères. Soyez précis pour faciliter la résolution.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting || loadingProduits || loadingMagasiniers || !formData.id_infirmier}
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
                  {editingSignale ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <i className={`fas ${editingSignale ? 'fa-save' : 'fa-paper-plane'} me-2`}></i>
                  {editingSignale ? 'Modifier' : 'Envoyer le signalement'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Signale;