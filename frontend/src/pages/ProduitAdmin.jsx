import React, { useState, useEffect } from 'react';
import {
  Container, Table, Button, Alert, Spinner,
  Badge, Card
} from 'react-bootstrap';
import { produitsAPI } from '../Services/api';

const ProduitAdmin = () => {
  // --- STATE ---
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // --- UI HELPERS ---

  const getStockBadge = (nombre) => {
    const n = parseInt(nombre);
    if (n > 50) return 'success';
    if (n > 10) return 'warning';
    return 'danger';
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
        <h2 className="text-primary"><i className="fas fa-boxes me-2"></i>Produits</h2>
        <Button variant="outline-primary" onClick={loadProduits}>
          <i className="fas fa-sync-alt me-2"></i>
          Actualiser
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table striped hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix Unitaire</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              {produits.length > 0 ? (
                produits.map((produit) => (
                  <tr key={produit.idP}>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProduitAdmin;
