import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Card, Badge, Button } from 'react-bootstrap';
import { diagnosticsAPI, patientsAPI, userAPI } from '../../Services/api';
import { useAuth } from '../../hooks/useAuth';

const DiagnosticsPatient = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [medecins, setMedecins] = useState({});

  useEffect(() => {
    if (user?.role === 'patient') loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([loadPatientDiagnostics(), loadAllMedecins()]);
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDiagnostics = async () => {
    try {
      const patientsResponse = await patientsAPI.getAllPatients();
      const currentPatient = patientsResponse.data?.find(p => p.CIN === user.CIN);
      if (!currentPatient) {
        setError('Informations patient non trouvées');
        return;
      }

      const response = await diagnosticsAPI.getDiagnosticByPatientId(currentPatient.id_patient);
      let diagnosticsList = [];
      
      if (response.data && Array.isArray(response.data)) diagnosticsList = response.data;
      else if (Array.isArray(response)) diagnosticsList = response;
      else if (response.data && typeof response.data === 'object') diagnosticsList = [response.data];
      
      setDiagnostics(diagnosticsList);
    } catch {
      setError('Erreur lors du chargement de vos diagnostics');
    }
  };

  const loadAllMedecins = async () => {
    try {
      const response = await userAPI.getAllMedecins();
      let medecinsList = [];
      
      if (response.data && Array.isArray(response.data)) medecinsList = response.data;
      else if (Array.isArray(response)) medecinsList = response;
      
      const medecinCache = {};
      medecinsList.forEach(medecin => {
        if (!medecin) return;
        const medecinId = medecin.id_medecin || medecin.id;
        if (!medecinId) return;
        
        let medecinInfo = {};
        if (medecin.user) {
          medecinInfo = {
            nom: medecin.user.nom,
            prenom: medecin.user.prenom,
            specialite: medecin.specialite || 'Généraliste',
            CIN: medecin.CIN || medecin.user.CIN
          };
        } else if (medecin.nom) {
          medecinInfo = {
            nom: medecin.nom,
            prenom: medecin.prenom,
            specialite: medecin.specialite || 'Généraliste',
            CIN: medecin.CIN
          };
        } else {
          medecinInfo = {
            nom: 'Médecin',
            prenom: `#${medecinId}`,
            specialite: medecin.specialite || 'Généraliste',
            CIN: medecin.CIN || 'N/A'
          };
        }
        
        medecinCache[medecinId] = medecinInfo;
      });
      
      setMedecins(medecinCache);
    } catch {
      setMedecins({});
    }
  };

  const getMedecinInfo = (medecinId) => {
    if (!medecinId) return { nomComplet: 'Non spécifié', specialite: 'N/A' };
    
    if (medecins[medecinId]) {
      const m = medecins[medecinId];
      return {
        nomComplet: `Dr. ${m.prenom || ''} ${m.nom || ''}`.trim() || 'Dr. Nom inconnu',
        specialite: m.specialite,
        CIN: m.CIN
      };
    }
    
    const diagnosticWithMedecin = diagnostics.find(d => d.id_medecin == medecinId);
    if (diagnosticWithMedecin?.medecin?.user) {
      const m = diagnosticWithMedecin.medecin.user;
      return {
        nomComplet: `Dr. ${m.prenom || ''} ${m.nom || ''}`.trim(),
        specialite: diagnosticWithMedecin.medecin.specialite || 'Généraliste',
        CIN: m.CIN || 'N/A'
      };
    }
    
    return {
      nomComplet: `Médecin #${medecinId}`,
      specialite: 'Non trouvée',
      CIN: 'N/A'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getEtatBadge = (etat) => {
    if (!etat) return <Badge bg="secondary">Inconnu</Badge>;
    const etatLower = etat.toLowerCase();
    
    if (etatLower.includes('approuvé') || etatLower.includes('approuver') || etatLower.includes('terminé')) {
      return <Badge bg="success">Approuvé</Badge>;
    } else if (etatLower.includes('attente')) {
      return <Badge bg="warning">En attente</Badge>;
    } else if (etatLower.includes('refusé') || etatLower.includes('refuser')) {
      return <Badge bg="danger">Refusé</Badge>;
    } else if (etatLower.includes('actif')) {
      return <Badge bg="info">Actif</Badge>;
    }
    return <Badge bg="light" text="dark">{etat}</Badge>;
  };

  const handleReload = () => {
    setError('');
    loadAllData();
  };

  const stats = {
    total: diagnostics.length,
    approuves: diagnostics.filter(d => d.etat?.toLowerCase().includes('approu')).length,
    enAttente: diagnostics.filter(d => d.etat?.toLowerCase().includes('attente')).length,
    refuses: diagnostics.filter(d => d.etat?.toLowerCase().includes('refus')).length
  };

  if (loading && diagnostics.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2">Chargement de vos diagnostics...</p>
        </div>
      </Container>
    );
  }

  if (!user || user.role !== 'patient') {
    return (
      <Container>
        <div className="mb-4">
          <h1>Accès non autorisé</h1>
          <p className="text-muted">Cette page est réservée aux patients</p>
        </div>
        <Alert variant="warning">
          <Alert.Heading>Accès restreint</Alert.Heading>
          <p>Vous devez être connecté en tant que patient pour accéder à cette page.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1>Mes Diagnostics</h1>
        <p className="text-muted">Historique de mes diagnostics médicaux</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" size="sm" onClick={handleReload}>Réessayer</Button>
        </Alert>
      )}

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon"><i className="fas fa-file-medical"></i></div>
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">Total</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success"><i className="fas fa-check-circle"></i></div>
              <div className="stats-number">{stats.approuves}</div>
              <div className="stats-label">Approuvés</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning"><i className="fas fa-clock"></i></div>
              <div className="stats-number">{stats.enAttente}</div>
              <div className="stats-label">En attente</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-danger"><i className="fas fa-times-circle"></i></div>
              <div className="stats-number">{stats.refuses}</div>
              <div className="stats-label">Refusés</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="fas fa-stethoscope me-2"></i>Liste des Diagnostics</h5>
          <div>
            <Button variant="outline-primary" onClick={handleReload} className="me-2" disabled={loading}>
              <i className="fas fa-sync-alt me-1"></i>Actualiser
            </Button>
            <Badge bg="primary" className="fs-6">{diagnostics.length} diagnostic(s)</Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {diagnostics.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-stethoscope fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun diagnostic trouvé</h5>
              <p className="text-muted">{error ? 'Erreur de chargement des données' : 'Vous n\'avez pas encore de diagnostics enregistrés.'}</p>
              {!error && <Button variant="primary" onClick={handleReload}><i className="fas fa-sync-alt me-2"></i>Actualiser</Button>}
            </div>
          ) : (
            <Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Médecin</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Résultats</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((diagnostic, index) => {
                  const medecinInfo = getMedecinInfo(diagnostic.id_medecin);
                  
                  return (
                    <tr key={`diagnostic-${index}-${diagnostic.idD || diagnostic.id || index}`}>
                      <td>
                        <strong>{medecinInfo.nomComplet}</strong>
                       
                      </td>
                      <td>{formatDate(diagnostic.dateD)}</td>
                      <td><div className="text-truncate" style={{ maxWidth: '200px' }} title={diagnostic.description}>{diagnostic.description || 'Non spécifié'}</div></td>
                      <td><div className="text-truncate" style={{ maxWidth: '200px' }} title={diagnostic.resultats}>{diagnostic.resultats || 'Non spécifié'}</div></td>
                      <td>{getEtatBadge(diagnostic.etat)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DiagnosticsPatient;