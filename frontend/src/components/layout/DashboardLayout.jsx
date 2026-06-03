import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Droplet, 
  Users, 
  Building2, 
  FileText, 
  Calendar,
  LogOut,
  Menu,
  X,
  Bell,
  BarChart2
} from 'lucide-react';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';

const DashboardLayout = () => {
  const { user, logout, activeRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const currentRole = user?.isDualRole ? (activeRole || user?.role) : user?.role;
      const res = await notificationService.getNotifications(currentRole);
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, activeRole]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const currentRole = user?.isDualRole ? (activeRole || user?.role) : user?.role;
      await notificationService.markAllAsRead(currentRole);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const currentRole = user?.isDualRole ? (activeRole || user?.role) : user?.role;
      await notificationService.clearAll(currentRole);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    const role = activeRole || user?.role;

    if (role === 'admin') {
      return [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
        { path: '/admin/requests', icon: <FileText size={20} />, label: 'Blood Requests' },
        { path: '/admin/inventory', icon: <Droplet size={20} />, label: 'Inventory' },
        { path: '/admin/donors', icon: <Users size={20} />, label: 'Donors' },
        { path: '/admin/camps', icon: <Calendar size={20} />, label: 'Camps' },
        { path: '/admin/reports', icon: <BarChart2 size={20} />, label: 'Analytics Reports' },
      ];
    }

    if (role === 'hospital') {
      return [
        { path: '/hospital', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
        { path: '/hospital/patients', icon: <Users size={20} />, label: 'Patients' },
        { path: '/hospital/add-patient', icon: <Building2 size={20} />, label: 'Add Patient' },
        { path: '/hospital/requests', icon: <FileText size={20} />, label: 'Blood Requests' },
        { path: '/hospital/request-blood', icon: <Droplet size={20} />, label: 'New Request' },
      ];
    }

    if (role === 'donor') {
      return [
        { path: '/donor', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
        { path: '/donor/history', icon: <Droplet size={20} />, label: 'Donation History' },
        { path: '/donor/camps', icon: <Calendar size={20} />, label: 'Upcoming Camps' },
        { path: '/donor/profile', icon: <Users size={20} />, label: 'My Profile & Eligibility' },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="layout-container" style={styles.container}>
      {/* Sidebar - Desktop & Mobile */}
      <aside style={{
        ...styles.sidebar
      }} className={`glass-panel sidebar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={styles.logoContainer}>
          <Droplet color="var(--primary-red)" size={28} fill="var(--primary-red)" />
          <h2 style={styles.logoText}>Raktha Bandhu</h2>
        </div>

        <nav style={styles.navConfig}>
          {navLinks.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              end={link.exact}
              onClick={() => setIsMobileMenuOpen(false)}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {/* Top Header */}
        <header style={styles.header} className="glass-panel">
          <div style={styles.headerLeft}>
            <button 
              className="mobile-menu-toggle"
              style={styles.mobileMenuToggle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 style={styles.pageTitle}>Welcome back, {user?.name?.split(' ')[0]}</h2>
          </div>
          
          <div style={styles.headerRight}>
            {/* No portal-switching inside dashboard — users must logout to switch portals */}

            <div style={{ position: 'relative' }}>
              <button 
                style={styles.iconBtn} 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    backgroundColor: 'var(--primary-red)', color: 'white',
                    borderRadius: '50%', width: '18px', height: '18px',
                    fontSize: '0.65rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: '700'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="glass-panel" style={{
                  position: 'absolute', right: 0, top: '50px', width: '320px',
                  maxHeight: '400px', overflowY: 'auto', zIndex: 60,
                  backgroundColor: 'white', border: '1px solid var(--border-light)',
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: '700' }}>Notifications</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Mark read</button>
                      <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Clear</button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No notifications.
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            handleMarkAsRead(n._id);
                            setShowNotifications(false);
                          }}
                          style={{
                            padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            backgroundColor: n.read ? 'transparent' : 'var(--secondary-red)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.8rem', position: 'relative', transition: 'all 0.2s',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              backgroundColor: n.type === 'alert' ? '#e11d48' : n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#10b981' : '#3b82f6',
                              flexShrink: 0
                            }}></span>
                            {n.title}
                          </div>
                          <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>{n.message}</div>
                          <div style={{ marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={styles.userProfileBtn}>
              <div style={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details" style={{display: 'flex', flexDirection: 'column'}}>
                <span style={styles.userName}>{user?.name}</span>
                <span style={styles.userRole}>{activeRole || user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Output */}
        <div style={styles.pageContent} className="animate-fade-in pageContent">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
  },
  sidebar: {
    width: '280px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 50,
    borderRight: '1px solid var(--border-light)',
    borderRadius: 0, // override glass-panel
    transition: 'transform 0.3s ease',
  },
  logoContainer: {
    padding: '30px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-light)',
  },
  logoText: {
    fontSize: '1.5rem',
    color: 'var(--primary-red)',
    margin: 0,
  },
  navConfig: {
    flex: 1,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: 'var(--secondary-red)',
    color: 'var(--primary-red)',
  },
  sidebarFooter: {
    padding: '24px',
    borderTop: '1px solid var(--border-light)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  mainContent: {
    flex: 1,
    marginLeft: '280px', // Desktop default
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    height: '80px',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-light)',
    borderRadius: 0, // override glass
    zIndex: 40,
    position: 'sticky',
    top: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  mobileMenuToggle: {
    display: 'none', // Overridden in CSS media query below
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  pageTitle: {
    fontSize: '1.25rem',
    margin: 0,
    color: 'var(--text-main)',
    fontWeight: '600',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  iconBtn: {
    background: 'var(--bg-main)',
    border: '1px solid var(--border-light)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  userProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'var(--primary-red)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1.1rem',
  },
  userName: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  pageContent: {
    padding: '32px',
    flex: 1,
    overflowY: 'auto',
    backgroundColor: 'var(--bg-main)',
  }
};

export default DashboardLayout;
