import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { userAPI } from '../Services/api'; // Chemin corrigé

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (CIN) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userAPI.deleteUser(CIN);
        setUsers(users.filter(user => user.CIN !== CIN));
        alert('Utilisateur supprimé avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error('Erreur:', err);
      }
    }
  };

  // Changer l'état d'un utilisateur
  const handleChangeState = async (CIN) => {
    try {
      await userAPI.changeUserState(CIN);
      loadUsers(); // Recharger la liste
      alert('État utilisateur modifié avec succès');
    } catch (err) {
      setError('Erreur lors du changement d\'état');
      console.error('Erreur:', err);
    }
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
        <h1>Gestion des Utilisateurs</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Ajouter un utilisateur
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>CIN</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.CIN}>
              <td>{user.CIN}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'medecin' ? 'bg-primary' : 'bg-success'}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`badge ${user.etat === 'actif' ? 'bg-success' : 'bg-warning'}`}>
                  {user.etat || 'actif'}
                </span>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowModal(true);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleChangeState(user.CIN)}
                  >
                    <i className="fas fa-power-off"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.CIN)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal pour ajouter/modifier un utilisateur */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>CIN</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le CIN"
                defaultValue={selectedUser?.CIN || ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nom complet</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom complet"
                defaultValue={selectedUser?.name || ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Entrez l'email"
                defaultValue={selectedUser?.email || ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rôle</Form.Label>
              <Form.Select defaultValue={selectedUser?.role || ''}>
                <option value="">Sélectionnez un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="medecin">Médecin</option>
                <option value="infirmier">Infirmier</option>
                <option value="receptionniste">Réceptionniste</option>
                <option value="magasinier">Magasinier</option>
                <option value="patient">Patient</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            {selectedUser ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Users;