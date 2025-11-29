import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { userAPI } from '../Services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    CIN: '',
    nom: '',
    prenom: '',
    email: '',
    role: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

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

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.CIN) {
      errors.CIN = 'Le CIN est obligatoire';
    } else if (!selectedUser) {
      // Vérifier si le CIN existe déjà seulement pour les nouveaux utilisateurs
      const cinExists = users.some(user => user.CIN === formData.CIN);
      if (cinExists) {
        errors.CIN = 'Ce CIN est déjà utilisé';
      }
    }

    if (!formData.nom) errors.nom = 'Le nom est obligatoire';
    if (!formData.prenom) errors.prenom = 'Le prénom est obligatoire';
    
    if (!formData.email) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    } else if (!selectedUser) {
      // Vérifier si l'email existe déjà seulement pour les nouveaux utilisateurs
      const emailExists = users.some(user => user.email === formData.email);
      if (emailExists) {
        errors.email = 'Cet email est déjà utilisé';
      }
    }

    if (!formData.role) errors.role = 'Le rôle est obligatoire';

    if (!selectedUser && !formData.password) {
      errors.password = 'Le mot de passe est obligatoire';
    } else if (!selectedUser && formData.password && formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ouvrir le modal pour modification
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      CIN: user.CIN || '',
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      role: user.role || '',
      password: '' // Ne pas pré-remplir le mot de passe pour la modification
    });
    setFormErrors({});
    setError('');
    setShowModal(true);
    
  };

  // Ouvrir le modal pour ajout
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      CIN: '',
      nom: '',
      prenom: '',
      email: '',
      role: '',
      password: ''
    });
    setFormErrors({});
    setError('');
    setShowModal(true);
  };

  // Sauvegarder l'utilisateur (ajout ou modification)
  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      setFormErrors({});

      let response;
      if (selectedUser) {
        // Modification d'un utilisateur existant
        // Ne pas envoyer le CIN pour la modification
        const { CIN, password, ...updateData } = formData;
        if (password) {
          updateData.password = password;
        }
        response = await userAPI.updateUser(selectedUser.CIN, updateData);
        alert('Utilisateur modifié avec succès');
      } else {
        // Ajout d'un nouvel utilisateur
        response = await userAPI.createUser(formData);
        alert('Utilisateur ajouté avec succès'+response);
      }

      // Recharger la liste des utilisateurs
      await loadUsers();
      
      // Fermer le modal et réinitialiser
      setShowModal(false);
      setSelectedUser(null);
      setFormData({
        CIN: '',
        nom: '',
        prenom: '',
        email: '',
        role: '',
        password: ''
      });

    } catch (err) {
      console.error('Erreur complète:', err);
      
      if (err.response?.data?.errors) {
        // Gestion des erreurs de validation du backend
        const backendErrors = err.response.data.errors;
        const formattedErrors = {};
        
        Object.keys(backendErrors).forEach(key => {
          formattedErrors[key] = backendErrors[key][0];
        });
        
        setFormErrors(formattedErrors);
        setError('Veuillez corriger les erreurs dans le formulaire');
      } else {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la sauvegarde';
        setError(errorMessage);
      }
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

  // Fonction pour activer/désactiver un utilisateur
  const handleToggleUserState = async (CIN) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/${CIN}/state`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        loadUsers();
        alert('État utilisateur modifié avec succès');
      } else {
        alert('Erreur lors de la modification de l\'état');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
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
        <Button variant="primary" onClick={handleAddUser}>
          <i className="fas fa-plus me-2"></i>
          Ajouter un utilisateur
        </Button>
      </div>

      {error && !showModal && <Alert variant="danger">{error}</Alert>}

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
              <td>{user.nom} {user.prenom}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={
                  user.role === 'admin' ? 'danger' : 
                  user.role === 'medecin' ? 'primary' : 
                  user.role === 'infirmier' ? 'info' :
                  user.role === 'receptionniste' ? 'warning' :
                  user.role === 'patient' ? 'secondary' :
                  user.role === 'magasinier' ? 'secondary' : 'success'
                }>
                  {user.role}
                </Badge>
              </td>
              <td>
                <Badge bg={user.etat === 'actif' ? 'success' : 'warning'}>
                  {user.etat || 'actif'}
                </Badge>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    title="Modifier"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant={user.etat === 'actif' ? 'outline-warning' : 'outline-success'}
                    size="sm"
                    onClick={() => handleToggleUserState(user.CIN)}
                    title={user.etat === 'actif' ? 'Désactiver' : 'Activer'}
                  >
                    <i className="fas fa-power-off"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.CIN)}
                    title="Supprimer"
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
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
          CIN: '',
          nom: '',
          prenom: '',
          email: '',
          role: '',
          password: ''
        });
        setFormErrors({});
        setError('');
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>CIN *</Form.Label>
              <Form.Control
                type="text"
                name="CIN"
                placeholder="Entrez le CIN"
                value={formData.CIN}
                onChange={handleInputChange}
                required
                disabled={!!selectedUser}
                isInvalid={!!formErrors.CIN}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.CIN}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nom *</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                placeholder="Entrez le nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                isInvalid={!!formErrors.nom}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.nom}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prénom *</Form.Label>
              <Form.Control
                type="text"
                name="prenom"
                placeholder="Entrez le prénom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                isInvalid={!!formErrors.prenom}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.prenom}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Entrez l'email"
                value={formData.email}
                onChange={handleInputChange}
                required
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rôle *</Form.Label>
              <Form.Select 
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                isInvalid={!!formErrors.role}
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="medecin">Médecin</option>
                <option value="infirmier">Infirmier</option>
                <option value="receptionniste">Réceptionniste</option>
                <option value="magasinier">Magasinier</option>
                <option value="patient">Patient</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.role}
              </Form.Control.Feedback>
              {formData.role && (
                <Form.Text className="text-muted">
                  Rôle sélectionné: {formData.role}
                </Form.Text>
              )}
            </Form.Group>

            {!selectedUser && (
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Entrez le mot de passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  isInvalid={!!formErrors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.password}
                </Form.Control.Feedback>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setSelectedUser(null);
            setFormData({
              CIN: '',
              nom: '',
              prenom: '',
              email: '',
              role: '',
              password: ''
            });
            setFormErrors({});
          }}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            {selectedUser ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Users;