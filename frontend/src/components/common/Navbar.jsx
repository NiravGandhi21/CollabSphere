import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  PlusCircle, 
  Users, 
  FolderKanban, 
  Inbox, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    addToast('You have been signed out successfully.', 'info');
    navigate('/');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinkStyles = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
    borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
    transition: 'all var(--transition-fast)'
  });

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.25rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
            color: '#FFFFFF'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Collab<span style={{ color: 'var(--primary-500)' }}>Sphere</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1 }}>
              ITM SLS Baroda University
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', gap: '1.25rem', alignItems: 'center' }} className="desktop-nav">
          <NavLink to="/projects" style={navLinkStyles}>
            <FolderKanban size={17} />
            Explore Projects
          </NavLink>
          <NavLink to="/students" style={navLinkStyles}>
            <Users size={17} />
            Find Teammates
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/collaborations" style={navLinkStyles}>
              <Inbox size={17} />
              Collaboration Inbox
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth & CTAs */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.875rem' }} className="desktop-nav">
          {isAuthenticated ? (
            <>
              <Link to="/projects/create" className="btn btn-primary btn-sm">
                <PlusCircle size={16} />
                Post Project
              </Link>

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer'
                  }}
                  aria-expanded={profileDropdownOpen}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '14rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    zIndex: 60
                  }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.department}</div>
                    </div>
                    <Link
                      to={`/students/${user.id}`}
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                      className="dropdown-item"
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <Link
                      to="/collaborations"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                      className="dropdown-item"
                    >
                      <Inbox size={15} /> Collaboration Requests
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: 'var(--radius-sm)',
                        color: '#EF4444',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      className="dropdown-item"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join Community
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-light)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <NavLink to="/projects" onClick={() => setMobileMenuOpen(false)} style={navLinkStyles}>
            <FolderKanban size={18} /> Explore Projects
          </NavLink>
          <NavLink to="/students" onClick={() => setMobileMenuOpen(false)} style={navLinkStyles}>
            <Users size={18} /> Find Teammates
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/collaborations" onClick={() => setMobileMenuOpen(false)} style={navLinkStyles}>
                <Inbox size={18} /> Collaboration Inbox
              </NavLink>
              <NavLink to={`/students/${user.id}`} onClick={() => setMobileMenuOpen(false)} style={navLinkStyles}>
                <User size={18} /> My Profile
              </NavLink>
              <Link
                to="/projects/create"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <PlusCircle size={16} /> Post Project Showcase
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', color: '#EF4444' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Join Community
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive Inline CSS */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        .dropdown-item:hover {
          background-color: var(--bg-subtle);
        }
      `}</style>
    </header>
  );
}
