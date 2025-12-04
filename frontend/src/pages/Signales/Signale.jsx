import React, { useState, useEffect } from 'react';
import { 
  Container, Table, Button, Alert, Spinner, Card, Badge, Modal, Form, Row, Col 
} from 'react-bootstrap';
import { signaleAPI, produitsAPI, userAPI } from '../../Services/api';
import { useAuth } from '../../hooks/useAuth';

const Signale = () => {
  const { user } = useAuth();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSignale, setEditingSignale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentInfirmierId, setCurrentInfirmierId] = useState(null);
  
  const [produits, setProduits] = useState([]);
  const [produitData, setProduitData] = useState({});
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
    loadAllData();
  }, []);

  // Fonctions utilitaires
  const getFullName = (userData) => {
    if (!userData) return 'Nom inconnu';
    return `${userData.prenom || ''} ${userData.nom || ''}`.trim() || 'Nom inconnu';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'repture': return <Badge bg="danger">Rupture</Badge>;
      case 'malfonctionnement': return <Badge bg="warning" text="dark">Dysfonctionnement</Badge>;
      default: return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const getStatutBadge = (statut) => {
    if (!statut) return <Badge bg="secondary">Non défini</Badge>;
    
    switch (statut) {
      case 'en_attente':
      case 'en attente': return <Badge bg="warning">En attente</Badge>;
      case 'en_cours':
      case 'en cours': return <Badge bg="info">En cours</Badge>;
      case 'resolu':
      case 'résolu': return <Badge bg="success">Résolu</Badge>;
      case 'rejete':
      case 'rejeté': return <Badge bg="danger">Rejeté</Badge>;
      default: return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  const getProduitInfo = (produitId) => {
    if (!produitId) return { nom: 'Non spécifié', nombre: 0 };
    
    if (produitData[produitId]) return produitData[produitId];
    
    const produit = produits.find(p => (p.idP || p.id) == produitId);
    if (produit) return {
      nom: produit.nom || `Produit #${produitId}`,
      nombre: produit.nombre || 0
    };
    
    return { nom: `Produit #${produitId}`, nombre: 0 };
  };

  // Chargement des données
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([
        loadSignalements(),
        loadCurrentInfirmierInfo(),
        loadAllProduits(),
        loadAllMagasiniers()
      ]);
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadSignalements = async () => {
    try {
      const response = await signaleAPI.getSignalements();
      let signalementsList = [];
      
      if (response.data && Array.isArray(response.data)) signalementsList = response.data;
      else if (Array.isArray(response)) signalementsList = response;
      else if (response.data && typeof response.data === 'object') signalementsList = [response.data];
      
      signalementsList = signalementsList.map(signale => ({
        ...signale,
        nbProduit: signale.nbProduit || signale.nb_produit || signale.quantite || ''
      }));
      
      setSignalements(signalementsList);
    } catch {
      setError('Erreur lors du chargement des signalements');
    }
  };

  const loadCurrentInfirmierInfo = async () => {
    if (!user?.CIN) return;

    try {
      let infirmierId = user.id_infirmier;
      
      if (!infirmierId) {
        try {
          const response = await userAPI.getAllInfirmiers();
          if (response.data?.find(i => i.CIN === user.CIN)) {
            infirmierId = response.data.find(i => i.CIN === user.CIN).id_infirmier;
          }
        } catch {}
      }
      
      if (!infirmierId) {
        try {
          const response = await userAPI.getUserByCIN(user.CIN);
          if (response.data) {
            const userData = response.data;
            infirmierId = userData.infirmiers?.id_infirmier || userData.infirmier?.id_infirmier || userData.id_infirmier;
          }
        } catch { }
      }
      
      if (infirmierId) setCurrentInfirmierId(infirmierId);
    } catch {}
  };

  const loadAllProduits = async () => {
    try {
      setLoadingProduits(true);
      const response = await produitsAPI.getProduits();
      let produitsList = [];
      
      if (response.data && Array.isArray(response.data)) produitsList = response.data;
      else if (Array.isArray(response)) produitsList = response;
      else if (response.data && typeof response.data === 'object') produitsList = [response.data];
      
      setProduits(produitsList);
      
      const produitCache = {};
      produitsList.forEach(produit => {
        if (!produit) return;
        const produitId = produit.idP || produit.id;
        if (!produitId) return;
        produitCache[produitId] = {
          nom: produit.nom || `Produit #${produitId}`,
          nombre: produit.nombre || 0
        };
      });
      
      setProduitData(produitCache);
    } catch {
      setProduits([]);
      setProduitData({});
    } finally {
      setLoadingProduits(false);
    }
  };

  const loadAllMagasiniers = async () => {
    try {
      setLoadingMagasiniers(true);
      const response = await userAPI.getAllMagasiniers();
      setMagasiniers(response.data && Array.isArray(response.data) ? response.data : []);
    } catch {
      setMagasiniers([]);
    } finally {
      setLoadingMagasiniers(false);
    }
  };

  useEffect(() => {
    if (currentInfirmierId) {
      setFormData(prev => ({ ...prev, id_infirmier: currentInfirmierId }));
    }
  }, [currentInfirmierId]);

  // Gestion du modal
  const handleShowModal = (signale = null) => {
    if (signale) {
      setEditingSignale(signale);
      setFormData({
        type: signale.type || 'repture',
        descriptionS: signale.descriptionS || '',
        nbProduit: signale.nbProduit || signale.nb_produit || signale.quantite || '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation et soumission
  const validateForm = () => {
    const errors = [];
    
    if (!formData.type) errors.push('Type de signalement requis');
    if (!formData.descriptionS?.trim()) errors.push('Description requise');
    else if (formData.descriptionS.trim().length < 10) errors.push('Description doit contenir au moins 10 caractères');
    
    if (!formData.idP) errors.push('Veuillez sélectionner un produit');
    if (!formData.id_magasinier) errors.push('Veuillez sélectionner un magasinier');
    if (!formData.id_infirmier) errors.push('ID infirmier manquant');
    
    if (formData.type === 'repture') {
      if (!formData.nbProduit) errors.push('Quantité affectée requise pour une rupture');
      else if (isNaN(formData.nbProduit) || parseInt(formData.nbProduit) <= 0) errors.push('La quantité doit être un nombre positif');
    } else if (formData.type === 'malfonctionnement' && formData.nbProduit) {
      if (isNaN(formData.nbProduit) || parseInt(formData.nbProduit) < 0) errors.push('La quantité doit être un nombre positif ou zéro');
    }
    
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

      if (formData.nbProduit) {
        const quantite = parseInt(formData.nbProduit);
        if (!isNaN(quantite)) {
          apiData.nbProduit = quantite;
          apiData.nb_produit = quantite;
        }
      }

      if (editingSignale) {
        const signaleId = editingSignale.idS || editingSignale.id;
        if (!signaleId) throw new Error('ID du signalement manquant');
        await signaleAPI.updateSignale(signaleId, apiData);
        alert('Signalement modifié avec succès!');
      } else {
        await signaleAPI.createSignale(apiData);
        alert('Signalement créé avec succès!');
      }
      
      await loadSignalements();
      handleCloseModal();
      
    } catch (err) {
      let errorMessage = 'Erreur lors de l\'opération';
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errorMessage = errors.join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
      } catch {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleReload = () => {
    setError('');
    loadAllData();
  };

  // Statistiques
  const stats = {
    total: signalements.length,
    ruptures: signalements.filter(s => s.type === 'repture').length,
    dysfonctionnements: signalements.filter(s => s.type === 'malfonctionnement').length,
    enAttente: signalements.filter(s => s.statut === 'en_attente' || s.statut === 'en attente').length,
    resolus: signalements.filter(s => s.statut === 'resolu' || s.statut === 'résolu').length
  };

  if (loading && signalements.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des signalements...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1>Gestion des Signalements</h1>
        <p className="text-muted">Suivi des ruptures de stock et dysfonctionnements</p>
      </div>

      {error && !showModal && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" size="sm" onClick={handleReload}>
            Réessayer
          </Button>
        </Alert>
      )}

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon"><i className="fas fa-exclamation-circle"></i></div>
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Total</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-danger"><i className="fas fa-box-open"></i></div>
              <div className="stats-number">{stats.ruptures}</div>
              <div className="stats-label">Ruptures</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning"><i className="fas fa-tools"></i></div>
              <div className="stats-number">{stats.dysfonctionnements}</div>
              <div className="stats-label">Dysfonctionnements</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success"><i className="fas fa-check-circle"></i></div>
              <div className="stats-number">{stats.resolus}</div>
              <div className="stats-label">Résolus</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>Liste des Signalements</h5>
          <div>
            <Button variant="outline-primary" onClick={handleReload} className="me-2" disabled={loading}>
              <i className="fas fa-sync-alt me-1"></i>Actualiser
            </Button>
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="fas fa-plus me-1"></i>Nouveau Signalement
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {signalements.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun signalement trouvé</h5>
              <p className="text-muted">{error ? 'Erreur de chargement des données' : 'Commencez par créer un nouveau signalement'}</p>
              {!error && <Button variant="primary" onClick={() => handleShowModal()}><i className="fas fa-plus me-2"></i>Créer un signalement</Button>}
            </div>
          ) : (
            <Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Type</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {signalements.map((signale, index) => {
                  const produitInfo = getProduitInfo(signale.idP);
                  const quantite = signale.nbProduit || signale.nb_produit || signale.quantite;
                  
                  return (
                    <tr key={`signale-${index}-${signale.idS || signale.id || index}`}>
                      <td>{getTypeBadge(signale.type)}</td>
                      <td>
                        <strong>{produitInfo.nom}</strong>
                      </td>
                      <td>{quantite ? <Badge bg={quantite > 10 ? "danger" : "warning"}>{quantite} unités</Badge> : '-'}</td>
                      <td><div className="text-truncate" style={{ maxWidth: '200px' }} title={signale.descriptionS}>{signale.descriptionS || 'Non spécifié'}</div></td>
                      <td>{formatDate(signale.dateS || signale.created_at)}</td>
                      <td>{getStatutBadge(signale.statut)}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(signale)} title="Modifier"><i className="fas fa-edit"></i></Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSignale(signale)} title="Supprimer"><i className="fas fa-trash"></i></Button>
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

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-exclamation-triangle me-2"></i>{editingSignale ? 'Modifier le Signalement' : 'Nouveau Signalement'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitSignale}>
          <Modal.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de signalement *</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleInputChange} required disabled={submitting}>
                    <option value="repture">Rupture de stock</option>
                    <option value="malfonctionnement">Dysfonctionnement</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité affectée {formData.type === 'repture' && '*'}</Form.Label>
                  <Form.Control type="number" name="nbProduit" value={formData.nbProduit} onChange={handleInputChange} 
                    placeholder={formData.type === 'repture' ? "Nombre d'unités manquantes" : "Quantité concernée (optionnel)"}
                    required={formData.type === 'repture'} disabled={submitting} min="0" step="1" />
                  <Form.Text className="text-muted">
                    {formData.type === 'repture' ? 'Obligatoire : nombre d\'unités manquantes en stock' : 'Optionnel : nombre d\'unités concernées par le dysfonctionnement'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Produit concerné *</Form.Label>
                  {loadingProduits ? <div className="text-center p-2"><Spinner animation="border" size="sm" /> Chargement...</div> : 
                    <Form.Select name="idP" value={formData.idP} onChange={handleInputChange} required disabled={submitting}>
                      <option value="">-- Sélectionner un produit --</option>
                      {produits.map(produit => {
                        const produitId = produit.idP || produit.id;
                        const produitInfo = getProduitInfo(produitId);
                        return <option key={produitId} value={produitId}>{produitInfo.nom} (Stock: {produitInfo.nombre})</option>;
                      })}
                    </Form.Select>
                  }
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Magasinier responsable *</Form.Label>
                  {loadingMagasiniers ? <div className="text-center p-2"><Spinner animation="border" size="sm" /> Chargement...</div> : 
                    <Form.Select name="id_magasinier" value={formData.id_magasinier} onChange={handleInputChange} required disabled={submitting}>
                      <option value="">-- Sélectionner un magasinier --</option>
                      {magasiniers.map(magasinier => {
                        const nomComplet = `${magasinier.user?.prenom || ''} ${magasinier.user?.nom || ''}`.trim() || magasinier.nom || 'Nom inconnu';
                        return <option key={magasinier.id_magasinier} value={magasinier.id_magasinier}>{nomComplet} - {magasinier.CIN || 'N/A'}</option>;
                      })}
                    </Form.Select>
                  }
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description du problème *</Form.Label>
              <Form.Control as="textarea" rows={2} name="descriptionS" value={formData.descriptionS} onChange={handleInputChange} 
                placeholder="Décrivez en détail le problème rencontré..." required disabled={submitting} minLength={10} />
              <Form.Text className="text-muted">Minimum 2 caractères. Soyez précis pour faciliter la résolution.</Form.Text>
            </Form.Group>

            {currentInfirmierId ? 
              <Alert variant="info" className="mb-0"><i className="fas fa-user-nurse me-2"></i>Signalement effectué par : <strong>{getFullName(user)}</strong> </Alert> :
              <Alert variant="warning" className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>Chargement de vos informations... Vous devez être connecté en tant qu'infirmier.</Alert>
            }
            
            <input type="hidden" name="id_infirmier" value={formData.id_infirmier} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>Annuler</Button>
            <Button variant="primary" type="submit" disabled={submitting || loadingProduits || loadingMagasiniers || !formData.id_infirmier}>
              {submitting ? <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                {editingSignale ? 'Modification...' : 'Création...'}
              </> : <>
                <i className={`fas ${editingSignale ? 'fa-save' : 'fa-paper-plane'} me-2`}></i>
                {editingSignale ? 'Modifier' : 'Envoyer le signalement'}
              </>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Signale;