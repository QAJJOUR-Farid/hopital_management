import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Badge
} from 'react-bootstrap';
import { userAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ModifierInfos = () => {
  const { user, logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    num_tel: '',
    adresse: ''
  });

  // Role-specific data
  const [roleData, setRoleData] = useState({
    // Patient fields
    gender: '',
    poids: '',
    height: '',
    // Medecin fields
    annee_travail: '',
    specialite: '',
    descriptio: '',
    // Infirmier fields
    service: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        num_tel: user.num_tel || '',
        adresse: user.adresse || ''
      });

      // Initialize role-specific data
      if (user.patient) {
        setRoleData(prev => ({
          ...prev,
          gender: user.patient.gender === 'M' ? 'homme' : user.patient.gender === 'F' ? 'femme' : '',
          poids: user.patient.poids || '',
          height: user.patient.height || ''
        }));
      }
      if (user.medecins) {
        setRoleData(prev => ({
          ...prev,
          annee_travail: user.medecins.annee_travail || '',
          specialite: user.medecins.specialite || '',
          descriptio: user.medecins.descriptio || ''
        }));
      }
      if (user.infirmiers || user.infirmier) {
        const infirmierData = user.infirmiers || user.infirmier;
        setRoleData(prev => ({
          ...prev,
          service: infirmierData.service || ''
        }));
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    console.log('🚀 Début de la mise à jour du profil');
    console.log('User CIN:', user?.CIN);
    console.log('User Role:', user?.role);

    try {
      if (!user?.CIN) {
        throw new Error('CIN utilisateur manquant');
      }
      
      if (!user?.role) {
        throw new Error('Rôle utilisateur manquant');
      }

      const dataToSend = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        num_tel: formData.num_tel?.trim() || null,
        adresse: formData.adresse?.trim() || null,
        CIN: user.CIN
      };

      console.log('📤 Données à envoyer:', dataToSend);

      let response;
      let entityId;

      console.log('🔄 Récupération des données utilisateur complètes...');
      const userDataResponse = await userAPI.getUserByCIN(user.CIN);
      const fullUserData = userDataResponse.data;
      
      console.log('📊 Données utilisateur complètes:', fullUserData);

      if (user.role === 'patient') {
        entityId = fullUserData.patient?.id_patient;
        if (!entityId) throw new Error('ID patient introuvable');
        console.log('📍 Endpoint: PUT /patients/' + entityId);
        response = await userAPI.updatePatient(entityId, dataToSend);
        
      } else if (user.role === 'medecin') {
        entityId = fullUserData.medecins?.id_medecin || fullUserData.medecin?.id_medecin;
        if (!entityId) throw new Error('ID médecin introuvable');
        console.log('📍 Endpoint: PUT /medecins/' + entityId);
        response = await userAPI.updateMedecin(entityId, dataToSend);
        
      } else if (user.role === 'infirmier') {  // ✅ CORRECTION ICI
        entityId = fullUserData.infirmiers?.id_infirmier || fullUserData.infirmier?.id_infirmier;
        if (!entityId) throw new Error('ID infirmier introuvable');
        console.log('📍 Endpoint: PUT /infirmiers/' + entityId);
        response = await userAPI.updateInfirmier(entityId, dataToSend);
        
      } else if (user.role === 'magasinier') {
        entityId = fullUserData.magasiniers?.id_magasinier || fullUserData.magasinier?.id_magasinier;
        if (!entityId) throw new Error('ID magasinier introuvable');
        console.log('📍 Endpoint: PUT /magasiniers/' + entityId);
        response = await userAPI.updateMagasinier(entityId, dataToSend);
        
      } else if (user.role === 'receptionniste') {
        entityId = fullUserData.receptionniste?.id_rec;
        if (!entityId) throw new Error('ID réceptionniste introuvable');
        console.log('📍 Endpoint: PUT /receptionnistes/' + entityId);
        response = await userAPI.updateReceptionniste(entityId, dataToSend);
        
      } else if (user.role === 'admin') {
        entityId = fullUserData.admin?.id;
        if (!entityId) throw new Error('ID admin introuvable');
        console.log('📍 Endpoint: PUT /admin/' + entityId);
        response = await userAPI.updateAdmin(entityId, dataToSend);
        
      } else {
        console.error('❌ Rôle non supporté:', user.role);
        throw new Error(`Rôle non supporté: ${user.role}`);
      }

      console.log('✅ Réponse API:', response);
      console.log('✅ Données de réponse:', response.data);

      setSuccess('✅ Informations personnelles mises à jour avec succès !');

      const updatedUser = { 
        ...user, 
        nom: dataToSend.nom,
        prenom: dataToSend.prenom,
        email: dataToSend.email,
        num_tel: dataToSend.num_tel,
        adresse: dataToSend.adresse
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      console.log('✅ LocalStorage mis à jour');

      try {
        const freshUserData = await userAPI.getUserByCIN(user.CIN);
        if (freshUserData.data) {
          localStorage.setItem('userData', JSON.stringify(freshUserData.data));
          console.log('✅ Données fraîches rechargées depuis le serveur');
        }
      } catch (refreshError) {
        console.warn('⚠️ Impossible de recharger les données:', refreshError);
      }

      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ Réponse d\'erreur:', err.response);
      console.error('❌ Données d\'erreur:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      
      let errorMessage = 'Erreur lors de la mise à jour des informations';
      
      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 422 && err.response.data?.errors) {
          const validationErrors = Object.values(err.response.data.errors).flat();
          errorMessage = 'Erreurs de validation: ' + validationErrors.join(', ');
          console.error('❌ Erreurs de validation:', err.response.data.errors);
        } else if (err.response.status === 404) {
          errorMessage = 'Utilisateur non trouvé. Veuillez vous reconnecter.';
        } else {
          errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    console.log('🚀 Mise à jour des informations spécifiques au rôle');
    console.log('Role:', user?.role);
    console.log('RoleData:', roleData);

    try {
      if (!user?.role) {
        throw new Error('Rôle utilisateur manquant');
      }

      // Fetch full user data to get entity IDs
      console.log('🔄 Récupération des données utilisateur complètes pour mise à jour rôle...');
      const userDataResponse = await userAPI.getUserByCIN(user.CIN);
      const fullUserData = userDataResponse.data;
      console.log('📊 Données utilisateur complètes:', fullUserData);

      let response;
      let updateMessage = '';

      if (user.role === 'patient') {
        const entityId = fullUserData.patient?.id_patient;
        if (!entityId) throw new Error('ID patient introuvable');
        const dataToSend = {
          gender: roleData.gender === 'homme' ? 'M' : roleData.gender === 'femme' ? 'F' : null,
          poids: parseFloat(roleData.poids) || null,
          height: parseFloat(roleData.height) || null,
          CIN: user.CIN
        };
        console.log('📤 Données patient:', dataToSend);
        response = await userAPI.updatePatient(entityId, dataToSend);
        updateMessage = 'Informations médicales mises à jour avec succès !';

      } else if (user.role === 'medecin') {
        const entityId = fullUserData.medecins?.id_medecin || fullUserData.medecin?.id_medecin;
        if (!entityId) throw new Error('ID médecin introuvable');
        const dataToSend = {
          annee_travail: parseInt(roleData.annee_travail) || null,
          specialite: roleData.specialite?.trim() || null,
          descriptio: roleData.descriptio?.trim() || null,
          CIN: user.CIN
        };
        console.log('📤 Données médecin:', dataToSend);
        response = await userAPI.updateMedecin(entityId, dataToSend);
        updateMessage = 'Informations professionnelles mises à jour avec succès !';

      } else if (user.role === 'infirmier') {
        const entityId = fullUserData.infirmiers?.id_infirmier || fullUserData.infirmier?.id_infirmier;
        if (!entityId) throw new Error('ID infirmier introuvable');
        const dataToSend = {
          service: roleData.service?.trim() || null,
          CIN: user.CIN
        };
        console.log('📤 Données infirmier:', dataToSend);
        response = await userAPI.updateInfirmier(entityId, dataToSend);
        updateMessage = 'Informations professionnelles mises à jour avec succès !';

      } else {
        throw new Error('Pas de données spécifiques pour ce rôle');
      }

      console.log('✅ Réponse:', response.data);
      setSuccess('✅ ' + updateMessage);
      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      console.error('❌ Erreur mise à jour rôle:', err);

      let errorMessage = 'Erreur lors de la mise à jour des informations spécifiques';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('❌ Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('❌ Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!passwordData.currentPassword) {
      setError('❌ Le mot de passe actuel est requis');
      return;
    }

    setSubmitting(true);

    try {
      console.log('🔐 Tentative de changement de mot de passe');
      
      setSuccess('⚠️ Fonctionnalité de changement de mot de passe à implémenter dans le backend');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      console.error('❌ Erreur changement mot de passe:', err);
      
      let errorMessage = 'Erreur lors du changement de mot de passe';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Mot de passe actuel incorrect';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (user?.role === 'patient') {
      return (
        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-heartbeat me-2"></i>
              Informations médicales (Patient)
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleRoleSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Genre</Form.Label>
                    <Form.Select
                      name="gender"
                      value={roleData.gender}
                      onChange={handleRoleInputChange}
                      disabled={submitting}
                    >
                      <option value="">Sélectionner</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Poids (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="poids"
                      value={roleData.poids}
                      onChange={handleRoleInputChange}
                      disabled={submitting}
                      min="0"
                      step="0.1"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Taille (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      value={roleData.height}
                      onChange={handleRoleInputChange}
                      disabled={submitting}
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid">
                <Button
                  variant="success"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Mettre à jour les informations médicales
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      );
    }

    if (user?.role === 'medecin') {
      return (
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <i className="fas fa-user-md me-2"></i>
              Informations professionnelles (Médecin)
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleRoleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Années d'expérience</Form.Label>
                    <Form.Control
                      type="number"
                      name="annee_travail"
                      value={roleData.annee_travail}
                      onChange={handleRoleInputChange}
                      disabled={submitting}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Spécialité</Form.Label>
                    <Form.Control
                      type="text"
                      name="specialite"
                      value={roleData.specialite}
                      onChange={handleRoleInputChange}
                      disabled={submitting}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descriptio"
                  value={roleData.descriptio}
                  onChange={handleRoleInputChange}
                  disabled={submitting}
                  placeholder="Décrivez votre expérience et compétences..."
                />
              </Form.Group>

              <div className="d-grid">
                <Button
                  variant="info"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Mettre à jour les informations professionnelles
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      );
    }

    if (user?.role === 'infirmier') {  // ✅ CORRECTION ICI
      return (
        <Card className="mb-4">
          <Card.Header className="bg-secondary text-white">
            <h5 className="mb-0">
              <i className="fas fa-user-nurse me-2"></i>
              Informations professionnelles (Infirmier)
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleRoleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Service</Form.Label>
                <Form.Control
                  type="text"
                  name="service"
                  value={roleData.service}
                  onChange={handleRoleInputChange}
                  disabled={submitting}
                  placeholder="Entrez votre service..."
                />
              </Form.Group>

              <div className="d-grid">
                <Button
                  variant="secondary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Mettre à jour les informations professionnelles
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      );
    }

    return null;
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Modifier mes informations</h1>
        <Badge bg="info" className="fs-6">
          {user?.role}
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Informations personnelles
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prénom *</Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de téléphone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="num_tel"
                        value={formData.num_tel}
                        onChange={handleInputChange}
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CIN</Form.Label>
                      <Form.Control
                        type="text"
                        value={user?.CIN || ''}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Le CIN ne peut pas être modifié
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Mettre à jour les informations
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {renderRoleSpecificFields()}

          <Card>
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-lock me-2"></i>
                Changer le mot de passe
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe actuel *</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={submitting}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe *</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={submitting}
                        minLength={6}
                      />
                      <Form.Text className="text-muted">
                        Minimum 6 caractères
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le mot de passe *</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={submitting}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid">
                  <Button
                    variant="warning"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key me-2"></i>
                        Changer le mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Informations du compte
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Rôle:</strong>
                <Badge bg="secondary" className="ms-2">{user?.role}</Badge>
              </div>
              <div className="mb-3">
                <strong>Statut:</strong>
                <Badge bg={user?.etat === 'actif' ? 'success' : 'danger'} className="ms-2">
                  {user?.etat === 'actif' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>CIN:</strong> {user?.CIN}
              </div>
              <div className="mb-3">
                <strong>Email:</strong>
                <br />
                <small className="text-muted">{user?.email}</small>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-danger">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Zone dangereuse
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">
                Attention : Cette action vous déconnectera de l'application.
              </p>
              <div className="d-grid">
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                      logout();
                    }
                  }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Se déconnecter
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModifierInfos;