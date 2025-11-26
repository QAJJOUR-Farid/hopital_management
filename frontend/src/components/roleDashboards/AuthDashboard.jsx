import { useState } from 'react';
import PropTypes from 'prop-types';
import { login, register } from '/xampp/htdocs/hopital_management/frontend/src/api/authService';

/**
 * Landing dashboard with Login + Register panels.
 * Handles form toggling, conditional fields based on the selected role,
 * and emits navigation commands when auth succeeds.
 */
function AuthDashboard({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    role: 'patient',
    CIN: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    etat: 'actif',
    email: '',
    password: '',
    adresse: '',
    num_tel: '',
    gender: 'M',
    poids: '',
    height: '',
    id_rec: '',
    annee_travail: '',
    specialite: '',
    description: '',
    service: '',
    id_medecin: '',
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const data = await login(loginForm);
      setFeedback({ type: 'success', message: data.message });
      // For some roles, backend returns extra ids (ex: patient_id, magasinier_id)
      const extras = {};
      if (data.patient_id) extras.patientId = data.patient_id;
      if (data.magasinier_id) extras.magasinierId = data.magasinier_id;
      onAuthSuccess(data.role, data.user, extras);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message ?? 'Unable to login.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const payload = { ...registerForm };
      // Clean optional numeric fields so Laravel receives nulls rather than "".
      ['poids', 'height', 'id_rec', 'annee_travail', 'id_medecin'].forEach((key) => {
        if (payload[key] === '') delete payload[key];
      });

      await register(payload);
      setFeedback({
        type: 'success',
        message: 'Registration complete. You can now login.',
      });
      setActiveTab('login');
    } catch (error) {
      const errMessage = error.response?.data?.message
        ?? error.response?.data?.error
        ?? 'Unable to register.';
      setFeedback({ type: 'error', message: errMessage });
    } finally {
      setLoading(false);
    }
  };

  const updateLoginForm = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateRegisterForm = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderRoleSpecificFields = () => {
    switch (registerForm.role) {
      case 'patient':
        return (
          <>
            <div className="form-row">
              <label>Gender</label>
              <select name="gender" value={registerForm.gender} onChange={updateRegisterForm}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div className="form-row-group">
              <div>
                <label>Weight (kg)</label>
                <input name="poids" value={registerForm.poids} onChange={updateRegisterForm} />
              </div>
              <div>
                <label>Height (cm)</label>
                <input name="height" value={registerForm.height} onChange={updateRegisterForm} />
              </div>
            </div>
            <div className="form-row">
              <label>Receptionist ID (optional)</label>
              <input name="id_rec" value={registerForm.id_rec} onChange={updateRegisterForm} />
            </div>
          </>
        );
      case 'medecin':
        return (
          <>
            <div className="form-row">
              <label>Start Year</label>
              <input
                name="annee_travail"
                value={registerForm.annee_travail}
                onChange={updateRegisterForm}
              />
            </div>
            <div className="form-row">
              <label>Speciality</label>
              <input
                name="specialite"
                value={registerForm.specialite}
                onChange={updateRegisterForm}
              />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea
                name="description"
                value={registerForm.description}
                onChange={updateRegisterForm}
              />
            </div>
          </>
        );
      case 'infirmier':
        return (
          <>
            <div className="form-row">
              <label>Service</label>
              <input name="service" value={registerForm.service} onChange={updateRegisterForm} />
            </div>
            <div className="form-row">
              <label>Supervisor Doctor ID</label>
              <input
                name="id_medecin"
                value={registerForm.id_medecin}
                onChange={updateRegisterForm}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <section className="auth-board">
      <header className="auth-header">
        <h1>Hospital Portal</h1>
        <p>Choose an action to manage appointments, patients, and logistics.</p>
      </header>

      <div className="tab-switcher">
        <button
          type="button"
          className={activeTab === 'login' ? 'active' : ''}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="forms-wrapper">
        {activeTab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={updateLoginForm}
                required
              />
            </div>
            <div className="form-row">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={updateLoginForm}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Login'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-row">
              <label>Role</label>
              <select name="role" value={registerForm.role} onChange={updateRegisterForm}>
                <option value="admin">Admin</option>
                <option value="patient">Patient</option>
                <option value="medecin">Médecin</option>
                <option value="receptionniste">Receptionniste</option>
                <option value="infirmier">Infirmier</option>
                <option value="magasinier">Magasinier</option>
              </select>
            </div>

            <div className="form-row-group">
              <div>
                <label>CIN</label>
                <input name="CIN" value={registerForm.CIN} onChange={updateRegisterForm} required />
              </div>
              <div>
                <label>Phone</label>
                <input name="num_tel" value={registerForm.num_tel} onChange={updateRegisterForm} />
              </div>
            </div>

            <div className="form-row-group">
              <div>
                <label>First Name</label>
                <input name="prenom" value={registerForm.prenom} onChange={updateRegisterForm} required />
              </div>
              <div>
                <label>Last Name</label>
                <input name="nom" value={registerForm.nom} onChange={updateRegisterForm} required />
              </div>
            </div>

            <div className="form-row">
              <label>Email</label>
              <input type="email" name="email" value={registerForm.email} onChange={updateRegisterForm} required />
            </div>

            <div className="form-row">
              <label>Password</label>
              <input type="password" name="password" value={registerForm.password} onChange={updateRegisterForm} required />
            </div>

            <div className="form-row">
              <label>Date of Birth</label>
              <input type="date" name="date_naissance" value={registerForm.date_naissance} onChange={updateRegisterForm} required />
            </div>

            <div className="form-row">
              <label>Address</label>
              <textarea name="adresse" value={registerForm.adresse} onChange={updateRegisterForm} />
            </div>

            {renderRoleSpecificFields()}

            <button type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

AuthDashboard.propTypes = {
  onAuthSuccess: PropTypes.func.isRequired,
};

export default AuthDashboard;

