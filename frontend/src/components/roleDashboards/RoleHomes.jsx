import PropTypes from 'prop-types';

/**
 * Small helper map to keep every role specific view separate but still simple.
 */
const roleViews = {
  admin: (user) => (
    <section className="role-card">
      <h2>Admin Console</h2>
      <p>Welcome {user.nom}, you can approve users and manage stock levels.</p>
      <ul>
        <li>Review pending staff accounts</li>
        <li>Validate incidents raised by teams</li>
        <li>Oversee medicine deliveries</li>
      </ul>
    </section>
  ),
  patient: (user) => (
    <section className="role-card">
      <h2>Patient Space</h2>
      <p>Bonjour {user.prenom}, consult your prescriptions and book visits.</p>
      <ul>
        <li>Request appointments with doctors</li>
        <li>Track diagnostics provided by staff</li>
        <li>Update personal profile information</li>
      </ul>
    </section>
  ),
  medecin: (user) => (
    <section className="role-card">
      <h2>Médecin Workspace</h2>
      <p>Dr. {user.nom}, coordinate diagnostics and supervise infirmiers.</p>
      <ul>
        <li>Review assigned patients</li>
        <li>Validate diagnostic notes</li>
        <li>Approve stock requests for your service</li>
      </ul>
    </section>
  ),
  infirmier: () => (
    <section className="role-card">
      <h2>Infirmier Dashboard</h2>
      <p>Capture patient vitals and follow-up tasks from supervising doctors.</p>
      <ul>
        <li>View today&apos;s patient rounds</li>
        <li>Log medication administration</li>
        <li>Communicate with médecins</li>
      </ul>
    </section>
  ),
  receptionniste: () => (
    <section className="role-card">
      <h2>Reception Desk</h2>
      <p>Manage arrivals, registrations, and notify medical teams promptly.</p>
      <ul>
        <li>Register new patients via CIN</li>
        <li>Assign rendez-vous to médecins</li>
        <li>Reschedule visits upon patient requests</li>
      </ul>
    </section>
  ),
  magasinier: () => (
    <section className="role-card">
      <h2>Magasinier Tracker</h2>
      <p>Control product entries, deliveries, and low stock alerts.</p>
      <ul>
        <li>Monitor incoming livraison</li>
        <li>Confirm produit entries before storage</li>
        <li>Flag ruptures to administrators</li>
      </ul>
    </section>
  ),
};

const RoleHomes = ({ role, user }) => {
  const view = roleViews[role];

  if (!view) {
    return (
      <section className="role-card">
        <h2>Unknown Role</h2>
        <p>This user does not have a mapped dashboard yet.</p>
      </section>
    );
  }

  return view(user);
};

RoleHomes.propTypes = {
  role: PropTypes.string.isRequired,
  user: PropTypes.shape({
    nom: PropTypes.string,
    prenom: PropTypes.string,
  }).isRequired,
};

export default RoleHomes;

