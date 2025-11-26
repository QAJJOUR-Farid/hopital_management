import { useNavigate } from 'react-router-dom';
import AuthDashboard from '../components/roleDashboards/AuthDashboard';

/**
 * Landing page containing the requested dashboard with Login/Register buttons.
 */
function LandingPage() {
  const navigate = useNavigate();

  const handleAuthSuccess = (role, user, extras = {}) => {
    // extras can include patientId for patients or other metadata later.
    navigate(`/home/${role}`, { state: { user, ...extras } });
  };

  return (
    <main className="landing">
      <AuthDashboard onAuthSuccess={handleAuthSuccess} />
    </main>
  );
}

export default LandingPage;

