import { useLocation, useParams, Link } from 'react-router-dom';
import RoleHomes from '../components/roleDashboards/RoleHomes';
/* import AdminDashboard from '../components/roleDashboards/AdminDashboard';
import PatientDashboard from '../components/roleDashboards/PatientDashboard';
import MagasinierDashboard from '../components/roleDashboards/MagasinierDashboard'; */

/**
 * Displays the home/dashboard that matches the authenticated role.
 */
function RoleHome() {
  const { role } = useParams();
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return (
      <main className="role-layout">
        <p className="alert error">Missing user context. Please login again.</p>
        <Link to="/">Back to dashboard</Link>
      </main>
    );
  }

  // Admin has a richer dashboard implementing the full use cases.
  if (role === 'admin') {
    return (
      <main className="role-layout">
{/*         <AdminDashboard user={user} />
 */}        <Link to="/" className="back-link">Return to dashboard</Link>
      </main>
    );
  }

  // Patient dashboard: needs both user CIN and patient numeric id.
  if (role === 'patient') {
    // For now we expect patientId to be passed via location.state as well.
    const patientId = location.state?.patientId;
    if (!patientId) {
      return (
        <main className="role-layout">
          <p className="alert error">Missing patient id. Please login again as patient.</p>
          <Link to="/" className="back-link">Back to dashboard</Link>
        </main>
      );
    }

    return (
      <main className="role-layout">
{/*         <PatientDashboard user={user} patientId={patientId} />
 */}        <Link to="/" className="back-link">Return to dashboard</Link>
      </main>
    );
  }

  // Magasinier dashboard: needs magasinier numeric id to link stock actions.
  if (role === 'magasinier') {
    const magasinierId = location.state?.magasinierId;
    if (!magasinierId) {
      return (
        <main className="role-layout">
          <p className="alert error">Missing magasinier id. Please login again as magasinier.</p>
          <Link to="/" className="back-link">Back to dashboard</Link>
        </main>
      );
    }

    return (
      <main className="role-layout">
{/*         <MagasinierDashboard user={user} magasinierId={magasinierId} />
 */}        <Link to="/" className="back-link">Return to dashboard</Link>
      </main>
    );
  }

  return (
    <main className="role-layout">
{/*       <RoleHomes role={role} user={user} />
 */}      <Link to="/" className="back-link">Return to dashboard</Link>
    </main>
  );
}

export default RoleHome;

