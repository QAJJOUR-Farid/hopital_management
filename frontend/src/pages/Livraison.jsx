import React, { useState, useEffect } from 'react';
import { 
  Container, Table, Button, Alert, Spinner, 
  Modal, Form, Row, Col, Badge, Card 
} from 'react-bootstrap';
import { livraisonAPI, produitLivraisonAPI, produitsAPI, userAPI } from '../Services/api';
import { useAuth } from '../hooks/useAuth'; 

const Livraison = () => {
  // --- STATE GLOBAL ---
  const [livraisons, setLivraisons] = useState([]);
  const [allProduits, setAllProduits] = useState([]);
  const [allMagasiniers, setAllMagasiniers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth(); 

  // --- STATE MODALS ---
  const [showLivraisonModal, setShowLivraisonModal] = useState(false);
  const [editingLivraisonId, setEditingLivraisonId] = useState(null);
  const [formData, setFormData] = useState({ dateL: '', fournisseur: '' });
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [productForm, setProductForm] = useState({ idP: '', quantite: '' });

  // --- INITIALISATION ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const livResponse = await livraisonAPI.getLivraisons();
      const livData = livResponse.data.data || livResponse.data;
      setLivraisons(Array.isArray(livData) ? livData : []);

      const prodResponse = await produitsAPI.getProduits();
      setAllProduits(prodResponse.data.data || prodResponse.data || []);

      // Important : allMagasiniers contient les infos User (nom, prenom)
      const magResponse = await userAPI.getAllMagasiniers();
      setAllMagasiniers(magResponse.data.data || magResponse.data || []);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER DISPLAY (CORRIGÉ) ---
  const getMagasinierDisplay = (livraison) => {
    const id = livraison.id_magasinier;
    if (!id) return <span className="text-muted">Non assigné</span>;

    // 1. On cherche le magasinier correspondant dans la liste complète
    const foundMag = allMagasiniers.find(m => m.id_magasinier === id);

    // 2. Si trouvé et qu'il a un utilisateur lié -> On affiche Nom Prénom
    if (foundMag && foundMag.user) {
      return <Badge bg="secondary">{foundMag.user.nom} {foundMag.user.prenom}</Badge>;
    }
    
    // 3. Fallback : Si le backend a renvoyé la relation user directement dans la livraison
    if (livraison.magasinier && livraison.magasinier.user) {
      return <Badge bg="secondary">{livraison.magasinier.user.nom} {livraison.magasinier.user.prenom}</Badge>;
    }

    return <span className="text-muted">ID: {id}</span>;
  };

  // ============================================================
  // SECTION GESTION LIVRAISON
  // ============================================================

  const handleAddLivraison = () => {
    setEditingLivraisonId(null);
    setFormData({
      dateL: new Date().toISOString().split('T')[0],
      fournisseur: ''
    });
    setShowLivraisonModal(true);
  };

  const handleEditLivraison = (livraison) => {
    setEditingLivraisonId(livraison.id);
    setFormData({
      dateL: livraison.dateL,
      fournisseur: livraison.fournisseur
    });
    setShowLivraisonModal(true);
  };

  const handleDeleteLivraison = async (id) => {
    if (window.confirm('Supprimer cette livraison ?')) {
      try {
        await livraisonAPI.deleteLivraison(id);
        setLivraisons(livraisons.filter(l => l.id !== id));
        alert('Livraison supprimée.');
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const handleSaveLivraison = async () => {
    try {
      if (!user) {
        alert("Erreur: Vous n'êtes pas connecté.");
        return;
      }

      // LOGIQUE ID MAGASINIER
      let magasinierId = null;
      if (user.magasiniers && user.magasiniers.id_magasinier) {
          magasinierId = user.magasiniers.id_magasinier;
      } else if (allMagasiniers.length > 0) {
          const found = allMagasiniers.find(m => m.CIN === user.CIN);
          if (found) magasinierId = found.id_magasinier;
      }

      if (!magasinierId) {
        alert("Erreur configuration: Impossible de trouver votre ID Magasinier.");
        return;
      }

      const payload = {
        dateL: formData.dateL,
        fournisseur: formData.fournisseur,
        id_magasinier: parseInt(magasinierId)
      };

      if (editingLivraisonId) {
        await livraisonAPI.updateLivraison(editingLivraisonId, payload);
      } else {
        await livraisonAPI.createLivraison(payload);
      }

      setShowLivraisonModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'enregistrement.";
      setError(message);
    }
  };

  // --- PRODUITS ---
  const handleOpenProducts = (livraison) => {
    setSelectedLivraison(livraison);
    setProductForm({ idP: '', quantite: '' });
    setShowProductsModal(true);
  };

  const handleAddProductToLivraison = async () => {
    if (!productForm.idP || !productForm.quantite) return;
    try {
      await produitLivraisonAPI.createProduitLivraison({
        idL: selectedLivraison.id,
        idP: parseInt(productForm.idP),
        quantite: parseInt(productForm.quantite)
      });
      await loadData();
      alert("Produit ajouté !");
      setProductForm({ idP: '', quantite: '' });
      setShowProductsModal(false); 
    } catch (err) {
      alert("Erreur ajout produit.");
    }
  };

  const handleRemoveProductFromLivraison = async (idPivot) => {
    if(window.confirm("Retirer ?")) {
      try {
        await produitLivraisonAPI.deleteProduitLivraison(idPivot);
        await loadData();
        setShowProductsModal(false);
      } catch (err) { alert("Erreur retrait."); }
    }
  };

  if (loading) return <Container className="d-flex justify-content-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"><i className="fas fa-truck me-2"></i>Suivi des Livraisons</h2>
        <div className="d-flex align-items-center">
            {user && (
             <div className="me-3 text-muted small">
                Connecté : <strong>{user.nom} {user.prenom}</strong>
             </div>
            )}
          <Button variant="primary" onClick={handleAddLivraison}>
            <i className="fas fa-plus me-2"></i> Nouvelle Livraison
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Table striped hover responsive className="shadow-sm align-middle">
        <thead className="bg-light">
          <tr>
            <th>Date</th>
            <th>Fournisseur</th>
            <th>Responsable</th>
            <th>Contenu</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {livraisons.map((liv) => (
            <tr key={liv.id}>
              <td>{new Date(liv.dateL).toLocaleDateString()}</td>
              <td className="fw-bold">{liv.fournisseur}</td>
              
              {/* Appel de la fonction corrigée pour afficher le nom */}
              <td>{getMagasinierDisplay(liv)}</td>

              <td>
                <Badge bg="info" className="me-2">{liv.produits ? liv.produits.length : 0} prod.</Badge>
                <Button variant="outline-dark" size="sm" onClick={() => handleOpenProducts(liv)}>
                  <i className="fas fa-list"></i>
                </Button>
              </td>
              <td className="text-end">
                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditLivraison(liv)}><i className="fas fa-edit"></i></Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteLivraison(liv.id)}><i className="fas fa-trash"></i></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* MODALS RESTENT INCHANGÉES */}
      <Modal show={showLivraisonModal} onHide={() => setShowLivraisonModal(false)}>
        <Modal.Header closeButton><Modal.Title>Livraison</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
                <Form.Label>Magasinier</Form.Label>
                <Form.Control type="text" value={user ? `${user.nom} ${user.prenom}` : '...'} readOnly disabled className="bg-light" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={formData.dateL} onChange={(e) => setFormData({...formData, dateL: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fournisseur</Form.Label>
              <Form.Control type="text" value={formData.fournisseur} onChange={(e) => setFormData({...formData, fournisseur: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLivraisonModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleSaveLivraison}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProductsModal} onHide={() => setShowProductsModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Produits de la livraison #{selectedLivraison?.id}</Modal.Title></Modal.Header>
        <Modal.Body>
            <Row className="mb-3 g-2">
                <Col md={6}>
                    <Form.Select value={productForm.idP} onChange={(e) => setProductForm({...productForm, idP: e.target.value})}>
                        <option value="">Choix produit...</option>
                        {allProduits.map(p => <option key={p.idP || p.id} value={p.idP || p.id}>{p.nom} (Stock: {p.nombre})</option>)}
                    </Form.Select>
                </Col>
                <Col md={3}><Form.Control type="number" placeholder="Qté" value={productForm.quantite} onChange={(e) => setProductForm({...productForm, quantite: e.target.value})} /></Col>
                <Col md={3}><Button variant="success" className="w-100" onClick={handleAddProductToLivraison}>Ajouter</Button></Col>
            </Row>
            <Table size="sm">
                <thead><tr><th>Nom</th><th>Qté</th><th>Del</th></tr></thead>
                <tbody>
                    {selectedLivraison?.produits?.map(item => (
                        <tr key={item.id}>
                            <td>{item.produit?.nom}</td>
                            <td>{item.quantite}</td>
                            <td><Button variant="danger" size="sm" onClick={() => handleRemoveProductFromLivraison(item.id)}>X</Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Livraison;