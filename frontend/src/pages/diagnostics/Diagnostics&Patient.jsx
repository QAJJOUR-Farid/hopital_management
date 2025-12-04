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
  Row,
  Col,
  ListGroup
} from 'react-bootstrap';
import { patientsAPI, diagnosticsAPI } from '../../Services/api';

const Diagnostics = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDiagnostics, setPatientDiagnostics] = useState([]);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientsAPI.getAllPatients();
      setPatients(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des patients';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPatientDiagnostics = async (patient) => {
    setSelectedPatient(patient);
    setShowDiagnosticsModal(true);
    setLoadingDiagnostics(true);

    try {
      const response = await diagnosticsAPI.getDiagnosticByPatientId(patient.id_patient);
      setPatientDiagnostics(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des diagnostics:', err);
      setPatientDiagnostics([]);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const handleCloseDiagnosticsModal = () => {
    setShowDiagnosticsModal(false);
    setSelectedPatient(null);
    setPatientDiagnostics([]);
  };

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir le nom complet d'un utilisateur
  const getFullName = (user) => {
    if (!user) return '';
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  };

  // Fonction pour obtenir le badge d'état du diagnostic
  const getEtatBadge = (etat) => {
    switch (etat) {
      case 'approuver':
      case 'approuvé':
      case 'approved':
        return <Badge bg="success">Approuvé</Badge>;
      case 'enAttente':
      case 'pending':
        return <Badge bg="warning">En attente</Badge>;
      case 'refusé':
      case 'rejected':
        return <Badge bg="danger">Refusé</Badge>;
      default:
        return <Badge bg="light" text="dark">{etat || 'N/A'}</Badge>;
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
        <h1>Patients et leurs Diagnostics</h1>
        <Button variant="outline-primary" onClick={loadPatients}>
          <i className="fas fa-sync-alt me-2"></i>
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stats-number">{patients.length}</div>
              <div className="stats-label">Total Patients</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>Nom Complet</th>
            <th>CIN</th>
            <th>Date de Naissance</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Genre</th>
            <th>Poids (kg)</th>
            <th>Taille (cm)</th>
            <th>Adresse</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id_patient}>
              <td>
                <strong>{getFullName(patient.user)}</strong>
              </td>
              <td>{patient.user?.CIN || patient.CIN || patient.cin || 'N/A'}</td>
              <td>{formatDate(patient.user?.date_naissance || patient.date_naissance)}</td>
              <td>{patient.user?.num_tel || patient.telephone || 'N/A'}</td>
              <td>{patient.user?.email || 'N/A'}</td>
              <td>
                {patient.gender === 'M' ? 'Masculin' :
                 patient.gender === 'F' ? 'Féminin' : 'N/A'}
              </td>
              <td>{patient.poids ? `${patient.poids} kg` : 'N/A'}</td>
              <td>{patient.height ? `${patient.height} cm` : 'N/A'}</td>
              <td>{patient.user?.adresse || 'N/A'}</td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => handleShowPatientDiagnostics(patient)}
                  title="Voir les diagnostics"
                >
                  <i className="fas fa-stethoscope me-2"></i>
                  Diagnostics
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {patients.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun patient trouvé</h4>
          <p className="text-muted">Il n'y a aucun patient enregistré dans le système.</p>
        </div>
      )}

      {/* Modal pour voir les diagnostics du patient */}
      <Modal show={showDiagnosticsModal} onHide={handleCloseDiagnosticsModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Diagnostics de {selectedPatient ? getFullName(selectedPatient.user) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                </Col>
                <Col md={6}>
                  <strong>CIN:</strong> {selectedPatient.user?.CIN || selectedPatient.CIN || selectedPatient.cin || 'N/A'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Nom Complet:</strong> {getFullName(selectedPatient.user)}
                </Col>
                <Col md={6}>
                  <strong>Téléphone:</strong> {selectedPatient.telephone || 'N/A'}
                </Col>
              </Row>

              <hr />

              <h5>Historique des Diagnostics</h5>

              {loadingDiagnostics ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Chargement des diagnostics...</p>
                </div>
              ) : patientDiagnostics.length > 0 ? (
                <div className="diagnostics-list">
                  {patientDiagnostics.map((diagnostic, index) => (
                    <Card key={diagnostic.idD || index} className="mb-3">
                      <Card.Body>
                        <Row>
                          <Col md={3}>
                            <strong>ID Diagnostic:</strong><br />
                            #{diagnostic.idD}
                          </Col>
                          <Col md={3}>
                            <strong>Date:</strong><br />
                            {formatDate(diagnostic.dateD)}
                          </Col>
                          <Col md={3}>
                            <strong>État:</strong><br />
                            {getEtatBadge(diagnostic.etat)}
                          </Col>
                          <Col md={3}>
                            <strong>Médecin:</strong><br />
                            {diagnostic.medecin ? getFullName(diagnostic.medecin.user) : 'N/A'}
                          </Col>
                        </Row>
                        <Row className="mt-3">
                          <Col md={6}>
                            <strong>Description:</strong>
                            <div className="p-2 bg-light rounded mt-1" style={{ minHeight: '60px' }}>
                              {diagnostic.description || 'Non spécifié'}
                            </div>
                          </Col>
                          <Col md={6}>
                            <strong>Résultats:</strong>
                            <div className="p-2 bg-light rounded mt-1" style={{ minHeight: '60px' }}>
                              {diagnostic.resultats || 'Non spécifié'}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-stethoscope fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Aucun diagnostic trouvé</h5>
                  <p className="text-muted">Ce patient n'a aucun diagnostic enregistré.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDiagnosticsModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Diagnostics;
