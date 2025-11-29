import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VisitorPage.css";

function VisitorPage() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLoginClick = () => {
    navigate("/auth", { state: { activeTab: "login" } });
  };

  const handleRegisterClick = () => {
    navigate("/auth", { state: { activeTab: "register" } });
  };

  return (
    <div className="visitor-page">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#accueil">
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#0d6efd",
                borderRadius: "8px",
                marginRight: "10px",
              }}
            ></div>
            <h4 className="mb-0 fw-bold text-primary">HealthMate</h4>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#accueil"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("accueil");
                  }}
                >
                  Accueil
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("services");
                  }}
                >
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#equipe"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("equipe");
                  }}
                >
                  Équipe
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#apropos"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("apropos");
                  }}
                >
                  À Propos
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("contact");
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
            <div className="d-flex ms-3">
              <button 
                className="btn btn-outline-primary btn-custom me-2"
                onClick={handleLoginClick}
              >
                Connexion
              </button>
              <button 
                className="btn btn-primary btn-custom"
                onClick={handleRegisterClick}
              >
                Inscription
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-3 fw-bold mb-4">
                Bienvenue chez HealthMate
              </h1>
              <p className="lead mb-4">
                Votre plateforme complète de gestion hospitalière. Simplifiez la
                prise de rendez-vous, le suivi des diagnostics et la gestion des
                ressources médicales.
              </p>
              <button 
                className="btn btn-light btn-lg btn-custom me-3"
                onClick={handleRegisterClick}
              >
                Prendre Rendez-vous
              </button>
              <button 
                className="btn btn-outline-light btn-lg btn-custom"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("apropos");
                }}
              >
                En Savoir Plus
              </button>
            </div>
            <div className="col-lg-6 text-center">
              <div className="hero-image">🏥</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <p className="text-muted">Patients Satisfaits</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <p className="text-muted">Médecins Qualifiés</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-number">1000+</div>
                <p className="text-muted">Rendez-vous Gérés</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <p className="text-muted">Support Disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white">
        <div className="container">
          <h2 className="section-title text-center">Nos Services</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: "rgba(13, 110, 253, 0.1)" }}
                  >
                    <span style={{ color: "#0d6efd" }}>📅</span>
                  </div>
                  <h4 className="card-title text-center mb-3">
                    Gestion des Rendez-vous
                  </h4>
                  <p className="card-text text-center text-muted">
                    Planifiez, modifiez et annulez vos rendez-vous en toute
                    simplicité avec nos médecins spécialisés.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: "rgba(111, 66, 193, 0.1)" }}
                  >
                    <span style={{ color: "#6f42c1" }}>📋</span>
                  </div>
                  <h4 className="card-title text-center mb-3">
                    Suivi des Diagnostics
                  </h4>
                  <p className="card-text text-center text-muted">
                    Accédez à vos diagnostics médicaux et suivez l'évolution de
                    votre traitement en ligne.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: "rgba(25, 135, 84, 0.1)" }}
                  >
                    <span style={{ color: "#198754" }}>👨‍⚕️</span>
                  </div>
                  <h4 className="card-title text-center mb-3">
                    Médecins Qualifiés
                  </h4>
                  <p className="card-text text-center text-muted">
                    Consultez notre équipe de médecins expérimentés et choisissez
                    le spécialiste adapté à vos besoins.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: "rgba(220, 53, 69, 0.1)" }}
                  >
                    <span style={{ color: "#dc3545" }}>📦</span>
                  </div>
                  <h4 className="card-title text-center mb-3">
                    Gestion du Stock
                  </h4>
                  <p className="card-text text-center text-muted">
                    Système de gestion complet pour le matériel médical et les
                    médicaments.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}
                  >
                    <span style={{ color: "#ffc107" }}>📊</span>
                  </div>
                  <h4 className="card-title text-center mb-3">Statistiques</h4>
                  <p className="card-text text-center text-muted">
                    Tableaux de bord détaillés pour le suivi et l'analyse des
                    performances hospitalières.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card shadow-sm">
                <div className="card-body p-4">
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: "rgba(13, 202, 240, 0.1)" }}
                  >
                    <span style={{ color: "#0dcaf0" }}>🔔</span>
                  </div>
                  <h4 className="card-title text-center mb-3">Notifications</h4>
                  <p className="card-text text-center text-muted">
                    Recevez des alertes pour vos rendez-vous, résultats et mises
                    à jour importantes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="equipe" className="bg-light">
        <div className="container">
          <h2 className="section-title text-center">Notre Équipe</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="team-member">
                <div
                  className="team-avatar"
                  style={{ backgroundColor: "#0d6efd" }}
                >
                  👨‍⚕️
                </div>
                <h5 className="fw-bold">Dr. Médecins</h5>
                <p className="text-muted mb-2">Médecin Spécialiste</p>
                <p className="small text-muted">
                  Diagnostic et suivi médical des patients avec expertise
                  approfondie
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team-member">
                <div
                  className="team-avatar"
                  style={{ backgroundColor: "#6f42c1" }}
                >
                  👩‍⚕️
                </div>
                <h5 className="fw-bold">Infirmiers</h5>
                <p className="text-muted mb-2">Personnel Soignant</p>
                <p className="small text-muted">
                  Assistance médicale et suivi des soins des patients
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team-member">
                <div
                  className="team-avatar"
                  style={{ backgroundColor: "#198754" }}
                >
                  👨‍💼
                </div>
                <h5 className="fw-bold">Réceptionnistes</h5>
                <p className="text-muted mb-2">Accueil & Gestion</p>
                <p className="small text-muted">
                  Gestion des rendez-vous et accueil des patients
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="team-member">
                <div
                  className="team-avatar"
                  style={{ backgroundColor: "#dc3545" }}
                >
                  📦
                </div>
                <h5 className="fw-bold">Magasiniers</h5>
                <p className="text-muted mb-2">Gestion Stock</p>
                <p className="small text-muted">
                  Gestion du matériel médical et des médicaments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="apropos" className="bg-white" style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="section-title text-start">
                À Propos de HealthMate
              </h2>
              <p className="lead mb-4">
                HealthMate est une plateforme innovante de gestion hospitalière
                conçue pour simplifier l'expérience des patients et optimiser le
                travail du personnel médical.
              </p>
              <p className="mb-3">
                Notre système offre une solution complète qui permet aux patients
                de prendre rendez-vous facilement, de consulter leurs diagnostics
                en ligne, et de rester informés de leur suivi médical.
              </p>
              <p className="mb-4">
                Pour le personnel hospitalier, HealthMate propose des outils de
                gestion performants incluant la planification des rendez-vous, la
                gestion des diagnostics, le suivi du stock médical, et des
                tableaux de bord statistiques détaillés.
              </p>
              <div className="row">
                <div className="col-6">
                  <h5 className="fw-bold text-primary mb-2">
                    ✓ Interface Intuitive
                  </h5>
                  <p className="small text-muted">
                    Navigation simple et ergonomique
                  </p>
                </div>
                <div className="col-6">
                  <h5 className="fw-bold text-primary mb-2">
                    ✓ Sécurité Maximale
                  </h5>
                  <p className="small text-muted">Données médicales protégées</p>
                </div>
                <div className="col-6">
                  <h5 className="fw-bold text-primary mb-2">✓ Accessible 24/7</h5>
                  <p className="small text-muted">Disponible à tout moment</p>
                </div>
                <div className="col-6">
                  <h5 className="fw-bold text-primary mb-2">✓ Support Dédié</h5>
                  <p className="small text-muted">Assistance personnalisée</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image">🏥</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="cta-section">
        <div className="container text-center">
          <h2 className="display-4 fw-bold mb-4">Prêt à Commencer ?</h2>
          <p className="lead mb-5">
            Rejoignez HealthMate aujourd'hui et bénéficiez d'une gestion médicale
            moderne et efficace
          </p>
          <button 
            className="btn btn-light btn-lg btn-custom me-3"
            onClick={handleRegisterClick}
          >
            Créer un Compte
          </button>
          <button 
            className="btn btn-outline-light btn-lg btn-custom"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("contact");
            }}
          >
            Nous Contacter
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3">HealthMate</h5>
              <p className="text-muted">
                Votre plateforme de gestion hospitalière complète et innovante.
              </p>
            </div>
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3">Liens Rapides</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a
                    href="#accueil"
                    className="text-muted text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("accueil");
                    }}
                  >
                    Accueil
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#services"
                    className="text-muted text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("services");
                    }}
                  >
                    Services
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#equipe"
                    className="text-muted text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("equipe");
                    }}
                  >
                    Équipe
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#apropos"
                    className="text-muted text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("apropos");
                    }}
                  >
                    À Propos
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3">Contact</h5>
              <p className="text-muted mb-2">📧 contact@healthmate.com</p>
              <p className="text-muted mb-2">📞 +212 5XX-XXXXXX</p>
              <p className="text-muted">📍 Agadir, Maroc</p>
            </div>
          </div>
          <hr className="my-4" style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          <div className="text-center text-muted">
            <p className="mb-0">&copy; 2024 HealthMate. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VisitorPage;