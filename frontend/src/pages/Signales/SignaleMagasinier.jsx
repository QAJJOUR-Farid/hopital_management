import React, { useState, useEffect } from 'react';
import { 
  Container, Table, Button, Alert, Spinner, Card, Badge, Modal, Row, Col 
} from 'react-bootstrap';
import { signaleAPI, produitsAPI, userAPI } from '../../Services/api';
import { useAuth } from '../../hooks/useAuth';

const SignaleMagasinier = () => {
  const { user } = useAuth();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSignale, setSelectedSignale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentMagasinierId, setCurrentMagasinierId] = useState(null);
  
  const [produits, setProduits] = useState([]);
  const [infirmiers, setInfirmiers] = useState([]);
  const [loadingProduits, setLoadingProduits] = useState(false);
  const [loadingInfirmiers, setLoadingInfirmiers] = useState(false);
  const [infirmiersError, setInfirmiersError] = useState(''); // Nouvel état pour erreur infirmiers

  useEffect(() => {
    loadSignalements();
    loadCurrentMagasinierInfo();
    loadAllProduits();
    loadAllInfirmiers();
  }, []);

  const loadCurrentMagasinierInfo = async () => {
    if (!user?.CIN) {
      console.error('❌ Aucun CIN trouvé dans user');
      return;
    }

    try {
      console.log('🔍 Chargement magasinier pour CIN:', user.CIN);
      const response = await userAPI.getUserByCIN(user.CIN);
      console.log('📋 Réponse getUserByCIN:', response.data);
      
      const magasinierId = response.data?.magasiniers?.id_magasinier;
      
      if (magasinierId) {
        console.log('✅ ID magasinier trouvé:', magasinierId);
        setCurrentMagasinierId(magasinierId);
      } else {
        console.error('❌ Aucun ID magasinier trouvé dans la réponse');
      }
    } catch (err) {
      console.error('❌ Erreur chargement magasinier:', err);
    }
  };

  const loadSignalements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await signaleAPI.getSignalements();
      console.log('Signalements chargés:', response.data);
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

  const loadAllProduits = async () => {
    try {
      setLoadingProduits(true);
      const response = await produitsAPI.getProduits();
      setProduits(response.data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoadingProduits(false);
    }
  };

  const loadAllInfirmiers = async () => {
    try {
      setLoadingInfirmiers(true);
      setInfirmiersError('');
      const response = await userAPI.getAllInfirmiers();
      console.log('Infirmiers chargés:', response.data);
      setInfirmiers(response.data);
    } catch (err) {
      console.error('Erreur chargement infirmiers:', err);
      setInfirmiersError('Impossible de charger la liste des infirmiers');
      setInfirmiers([]); // Initialiser avec tableau vide
    } finally {
      setLoadingInfirmiers(false);
    }
  };

  const handleUpdateStatut = async (signaleId, newStatut) => {
    try {
      setSubmitting(true);
      setError('');

      console.log('🔄 Tentative de mise à jour du statut:', { signaleId, newStatut });

      const apiData = { statut: newStatut };
      console.log('📤 Données envoyées à l\'API:', apiData);

      const response = await signaleAPI.updateSignale(signaleId, apiData);
      console.log('✅ Réponse API:', response.data);

      if (response.status >= 200 && response.status < 300) {
        console.log('🎉 Statut mis à jour avec succès');
        
        setSignalements(prev => 
          prev.map(s => 
            (s.idS || s.id) === signaleId 
              ? { ...s, statut: newStatut }
              : s
          )
        );
        
        alert(`✅ Signalement marqué comme "${newStatut === 'resolu' ? 'résolu' : 'non résolu'}" !`);
        handleCloseDetailModal();
      } else {
        throw new Error(`Statut HTTP ${response.status}`);
      }
      
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      
      let errorMessage = 'Erreur lors de la mise à jour du statut';
      
      if (err.response) {
        console.log('📊 Réponse erreur:', err.response.data);
        
        errorMessage = err.response.data?.message || 
                      err.response.data?.error ||
                      JSON.stringify(err.response.data) ||
                      `Erreur ${err.response.status}`;
        
        if (err.response.status === 422 && err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(', ');
        }
      } else if (err.request) {
        errorMessage = 'Impossible de contacter le serveur';
      } else {
        errorMessage = err.message || 'Erreur inconnue';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowDetailModal = (signale) => {
    setSelectedSignale(signale);
    setShowDetailModal(true);
    setError('');
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSignale(null);
    setError('');
  };

  const handleDeleteSignale = async (signale) => {
    const signaleId = signale.idS || signale.id;
    
    if (!signaleId) {
      setError('ID du signalement manquant');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.')) {
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

  // Fonction simplifiée pour obtenir le nom de l'infirmier
  const getInfirmierName = (idInfirmier) => {
    if (!idInfirmier) return 'N/A';
    
    if (loadingInfirmiers) {
      return <Spinner animation="border" size="sm" />;
    }
    
    if (infirmiersError || infirmiers.length === 0) {
      return `Infirmier #${idInfirmier}`;
    }
    
    const infirmier = infirmiers.find(i => i.id_infirmier === idInfirmier);
    return infirmier && infirmier.user ? getFullName(infirmier.user) : `Infirmier #${idInfirmier}`;
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
    switch (statut) {
      case 'resolu':
        return <Badge bg="success">Résolu</Badge>;
      case 'nonResolu':
        return <Badge bg="danger">Non Résolu</Badge>;
      default:
        return <Badge bg="secondary">En attente</Badge>;
    }
  };

  // Filtrer les signalements pour le magasinier connecté
  const getFilteredSignalements = () => {
    if (currentMagasinierId) {
      return signalements.filter(s => s.id_magasinier == currentMagasinierId);
    }
    return signalements;
  };

  const filteredSignalements = getFilteredSignalements();
  const stats = {
    total: filteredSignalements.length,
    resolus: filteredSignalements.filter(s => s.statut === 'resolu').length,
    nonResolus: filteredSignalements.filter(s => s.statut === 'nonResolu').length,
    enAttente: filteredSignalements.filter(s => !s.statut || (s.statut !== 'resolu' && s.statut !== 'nonResolu')).length
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
        <h1>Gestion des Signalements - Magasinier</h1>
        <div>
          <small className="text-muted">
            Connecté en tant que: <strong>{getFullName(user)}</strong>
            {currentMagasinierId && ` (ID: ${currentMagasinierId})`}
          </small>
        </div>
      </div>

      {error && !showDetailModal && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {infirmiersError && (
        <Alert variant="warning" className="mb-3">
          <small>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {infirmiersError} - Affichage des ID infirmiers uniquement
          </small>
        </Alert>
      )}

      {currentMagasinierId && (
        <Alert variant="info" className="mb-3">
          <small>
            <i className="fas fa-filter me-2"></i>
            Affichage des signalements assignés à vous (Magasinier ID: {currentMagasinierId})
          </small>
        </Alert>
      )}

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Mes Signalements</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">{stats.enAttente}</div>
              <div className="stats-label">En Attente</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-danger">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stats-number">{stats.nonResolus}</div>
              <div className="stats-label">Non Résolus</div>
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
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSignalements.map((signale, index) => {
            const signaleId = signale.idS || signale.id;
            return (
              <tr key={signaleId || `signale-${index}`}>
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
                  <small>{getInfirmierName(signale.id_infirmier)}</small>
                </td>
                <td>{formatDate(signale.dateS || signale.created_at)}</td>
                <td>{getStatutBadge(signale.statut)}</td>
                <td>
                  <div className="btn-group-vertical btn-group-sm" role="group">
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleShowDetailModal(signale)}
                      title="Voir les détails"
                      className="mb-1"
                    >
                      <i className="fas fa-eye"></i> Détails
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteSignale(signale)}
                      title="Supprimer"
                    >
                      <i className="fas fa-trash"></i> Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {filteredSignalements.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun signalement trouvé</h4>
          <p className="text-muted">
            {currentMagasinierId 
              ? "Aucun signalement n'a été assigné à votre attention." 
              : "Chargement de vos signalements..."}
          </p>
        </div>
      )}

      {/* Modal de détails */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Détails du Signalement #{selectedSignale ? (selectedSignale.idS || selectedSignale.id) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          
          {selectedSignale && (
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <strong>Informations Générales</strong>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Type:</strong> {getTypeBadge(selectedSignale.type)}</p>
                    <p><strong>Produit:</strong> {getProduitName(selectedSignale.idP)} (ID: {selectedSignale.idP})</p>
                    <p><strong>Quantité:</strong> {selectedSignale.nbProduit || 'N/A'}</p>
                    <p><strong>Date:</strong> {formatDate(selectedSignale.dateS || selectedSignale.created_at)}</p>
                    <p><strong>Statut actuel:</strong> {getStatutBadge(selectedSignale.statut)}</p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <strong>Personnes concernées</strong>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      <strong>Infirmier:</strong><br />
                      {getInfirmierName(selectedSignale.id_infirmier)}
                      <br />
                      <small className="text-muted">ID: {selectedSignale.id_infirmier}</small>
                    </p>
                    <p>
                      <strong>Magasinier assigné:</strong><br />
                      <small className="text-muted">ID: {selectedSignale.id_magasinier}</small>
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={12}>
                <Card>
                  <Card.Header>
                    <strong>Description du problème</strong>
                  </Card.Header>
                  <Card.Body>
                    <p>{selectedSignale.descriptionS || 'Aucune description fournie'}</p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Section d'approbation */}
              <Col md={12} className="mt-4">
                <Card className="border-primary">
                  <Card.Header className="bg-primary text-white">
                    <strong>Changer le statut du signalement</strong>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="d-grid gap-2">
                          <Button 
                            variant="success" 
                            onClick={() => handleUpdateStatut(selectedSignale.idS || selectedSignale.id, 'resolu')}
                            disabled={submitting || selectedSignale.statut === 'resolu'}
                          >
                            {submitting ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <i className="fas fa-check me-2"></i>
                                Marquer comme Résolu
                              </>
                            )}
                          </Button>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-grid gap-2">
                          <Button 
                            variant="warning" 
                            onClick={() => handleUpdateStatut(selectedSignale.idS || selectedSignale.id, 'nonResolu')}
                            disabled={submitting || selectedSignale.statut === 'nonResolu'}
                          >
                            {submitting ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <i className="fas fa-times me-2"></i>
                                Marquer comme Non Résolu
                              </>
                            )}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal} disabled={submitting}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SignaleMagasinier;