import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Activity, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar} className="glass-panel">
        <div style={styles.logo}>
          <Droplet color="var(--primary-red)" size={28} fill="var(--primary-red)" />
          <span style={styles.logoText}>BDMS</span>
        </div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.linkBtn}>Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={styles.hero}>
        <div style={styles.heroContent} className="animate-fade-in">
          <div style={styles.badge}>Save Lives Today</div>
          <h1 style={styles.headline}>
            Your blood can bring <br /> <span style={{ color: 'var(--primary-red)' }}>hope to someone's life.</span>
          </h1>
          <p style={styles.subhead}>
            Join our centralized network connecting generous donors directly with hospitals in need. Every drop counts in the journey to save a life.
          </p>
          <div style={styles.ctaGroup}>
            <Link to="/register" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Become a Donor
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Hospital Access
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.featureGrid}>
          
          <FeatureCard 
            icon={<Heart size={32} color="#e11d48" />}
            title="Register as a Donor"
            desc="Sign up, track your donations, and find out exactly when you are eligible to safely donate again."
          />
          <FeatureCard 
            icon={<Activity size={32} color="#3b82f6" />}
            title="Hospital Requests"
            desc="Hospitals can broadcast urgent needs to our centralized inventory, ensuring fast fulfillment."
          />
          <FeatureCard 
            icon={<Droplet size={32} color="#10b981" />}
            title="Centralized Inventory"
            desc="A completely transparent, robust inventory management system ensuring zero wastage."
          />

        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>&copy; 2026 Blood Donation Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-panel hover-red-outline" style={styles.featureCard}>
    <div style={styles.iconWrapper}>{icon}</div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{desc}</p>
  </div>
);

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-main)',
    backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(225, 29, 72, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.05), transparent 25%)',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 5%',
    position: 'sticky',
    top: '20px',
    margin: '0 5%',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  linkBtn: {
    fontWeight: '600',
    color: 'var(--text-main)',
    fontSize: '0.95rem'
  },
  hero: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 5% 80px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    color: 'var(--primary-red)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.85rem',
    marginBottom: '24px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  headline: {
    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
    lineHeight: 1.1,
    marginBottom: '24px',
    color: 'var(--text-main)',
  },
  subhead: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    marginBottom: '40px',
    maxWidth: '600px',
    lineHeight: 1.6,
  },
  ctaGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  features: {
    padding: '80px 5%',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-light)',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '48px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    transition: 'transform 0.3s ease',
    cursor: 'default'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px'
  },
  featureTitle: {
    fontSize: '1.25rem',
    margin: 0
  },
  featureDesc: {
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: 1.6
  },
  footer: {
    padding: '32px 5%',
    textAlign: 'center',
    borderTop: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-main)'
  }
};

export default LandingPage;
