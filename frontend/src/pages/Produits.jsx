import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Card } from 'react-bootstrap';
import { produitsAPI } from '../Services/api';

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      setLoading(true);
      const response = await produitsAPI.getProduits();
      setProduits(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduit = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await produitsAPI.deleteProduit(id);
        setProduits(produits.filter(prod => prod.id !== id));
        alert('Produit supprimé avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error('Erreur:', err);
      }
    }
  };

  const getStockBadge = (quantite) => {
    if (quantite > 50) return 'success';
    if (quantite > 10) return 'warning';
    return 'danger';
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
        <h1>Gestion des Produits Médicaux</h1>
        <Button variant="primary">
          <i className="fas fa-plus me-2"></i>
          Nouveau Produit
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="stats-number">{produits.length}</div>
              <div className="stats-label">Produits Totaux</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Prix</th>
            <th>Quantité</th>
            <th>Catégorie</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((produit) => (
            <tr key={produit.id}>
              <td>#{produit.id}</td>
              <td>{produit.nom}</td>
              <td>{produit.description}</td>
              <td>{produit.prix} DH</td>
              <td>
                <Badge bg={getStockBadge(produit.quantite)}>
                  {produit.quantite} unités
                </Badge>
              </td>
              <td>
                <Badge bg="info">
                  {produit.categorie}
                </Badge>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Button variant="outline-primary" size="sm">
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteProduit(produit.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Produits;