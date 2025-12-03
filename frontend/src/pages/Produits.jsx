import React, { useState, useEffect } from 'react';
import { 
  Container, Table, Button, Alert, Spinner, 
  Badge, Card, Modal, Form, Row, Col 
} from 'react-bootstrap';
import { produitsAPI } from '../Services/api';

const Produits = () => {
  // --- STATE ---
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  const [formData, setFormData] = useState({
    nom: '',
    nombre: '',
    prix_unitaire: '',
    categorie: 'medicament'
  });

  // --- LIFECYCLE ---
  useEffect(() => {
    loadProduits();
  }, []);

  // --- API ACTIONS ---

  // 1. GET ALL
  const loadProduits = async () => {
    try {
      setLoading(true);
      const response = await produitsAPI.getProduits();
      // Gestion de la structure de réponse Laravel
      const data = response.data.data || response.data;
      setProduits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError('Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  };

  // 2. DELETE (CORRIGÉ avec idP)
  const handleDelete = async (id) => {
    console.log("Tentative de suppression ID (idP):", id);

    if (!id) {
      alert("Erreur critique: L'ID du produit est introuvable (undefined).");
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        // On passe l'idP à l'API qui attend probablement /produit/{id}/destroy
        await produitsAPI.deleteProduit(id);
        
        // Mise à jour locale : on filtre sur idP
        setProduits(current => current.filter(prod => prod.idP !== id));
        
        alert('Produit supprimé avec succès');
      } catch (err) {
        console.error("Erreur Delete:", err);
        const msg = err.response?.data?.error || 'Erreur lors de la suppression';
        setError(msg);
      }
    }
  };

  // 3. SAVE (CREATE / UPDATE)
  const handleSave = async () => {
    setError('');
    try {
      // Validation
      if (!formData.nom || !formData.nombre || !formData.prix_unitaire) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      // Préparation Payload
      const payload = {
        nom: formData.nom,
        categorie: formData.categorie,
        nombre: parseInt(formData.nombre),
        prix_unitaire: parseFloat(formData.prix_unitaire),
      };

      if (editingId) {
        // UPDATE : on utilise editingId (qui contient l'idP)
        console.log("Update ID:", editingId);
        await produitsAPI.updateProduit(editingId, payload);
        alert('Produit mis à jour avec succès');
      } else {
        // CREATE
        await produitsAPI.createProduit(payload);
        alert('Produit créé avec succès');
      }

      handleCloseModal();
      loadProduits(); // Recharger pour voir les changements

    } catch (err) {
      console.error("Erreur Save:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la sauvegarde.';
      setError(msg);
    }
  };

  // --- UI HELPERS ---

  const getStockBadge = (nombre) => {
    const n = parseInt(nombre);
    if (n > 50) return 'success';
    if (n > 10) return 'warning';
    return 'danger';
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nom: '',
      nombre: '',
      prix_unitaire: '',
      categorie: 'medicament'
    });
    setShowModal(true);
    setError('');
  };

  const handleEdit = (produit) => {
    // CORRECTION ICI : On utilise produit.idP
    console.log("Objet produit reçu pour édition:", produit);
    
    if (!produit.idP) {
      console.error("ERREUR: Le produit n'a pas de propriété 'idP'", produit);
      alert("Erreur: Impossible d'éditer, ID manquant.");
      return;
    }

    setEditingId(produit.idP); // Sauvegarde l'idP
    setFormData({
      nom: produit.nom,
      nombre: produit.nombre,
      prix_unitaire: produit.prix_unitaire,
      categorie: produit.categorie
    });
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"><i className="fas fa-boxes me-2"></i>Gestion des Produits</h2>
        <Button variant="primary" onClick={handleAdd}>
          <i className="fas fa-plus me-2"></i> Nouveau Produit
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table striped hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix Unitaire</th>
                <th>Quantité</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.length > 0 ? (
                produits.map((produit) => (
                  // CORRECTION IMPORTANTE : key={produit.idP}
                  <tr key={produit.idP}>
                    <td>#{produit.idP}</td> 
                    <td className="fw-bold">{produit.nom}</td>
                    <td>
                      <Badge bg={produit.categorie === 'medicament' ? 'info' : 'secondary'}>
                        {produit.categorie === 'medicament' ? 'Médicament' : 'Matériel'}
                      </Badge>
                    </td>
                    <td>{parseFloat(produit.prix_unitaire).toFixed(2)} DH</td>
                    <td>
                      <Badge bg={getStockBadge(produit.nombre)}>
                        {produit.nombre} unités
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        // CORRECTION : Passe l'objet entier, handleEdit utilisera .idP
                        onClick={() => handleEdit(produit)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        // CORRECTION : Suppression avec .idP
                        onClick={() => handleDelete(produit.idP)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Form */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? `Modifier Produit #${editingId}` : 'Ajouter un Produit'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom du produit <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Ex: Paracétamol"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Catégorie <span className="text-danger">*</span></Form.Label>
              <Form.Select 
                name="categorie" 
                value={formData.categorie} 
                onChange={handleInputChange}
              >
                <option value="medicament">Médicament</option>
                <option value="materiel">Matériel</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix Unitaire (DH) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="prix_unitaire"
                    value={formData.prix_unitaire}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre (Stock) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingId ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Produits;