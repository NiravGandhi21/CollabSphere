import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-dark)',
      color: 'var(--text-light-muted)',
      borderTop: '1px solid var(--border-dark)',
      marginTop: 'auto',
      padding: '4rem 0 2rem 0'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Column 1: Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Collab<span style={{ color: 'var(--primary-400)' }}>Sphere</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              A dedicated student collaboration, capstone discovery, and hackathon team assembly platform built for the student community of ITM SLS Baroda University.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://github.com/NiravGandhi21/CollabSphere"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-sm"
                style={{ border: '1px solid var(--border-dark)' }}
                aria-label="View CollabSphere GitHub Repository"
              >
                <Github size={15} /> GitHub Repository
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9375rem' }}>Platform Discovery</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/projects" style={{ color: 'var(--text-light-muted)' }} className="footer-link">
                  Browse Project Showcases
                </Link>
              </li>
              <li>
                <Link to="/students" style={{ color: 'var(--text-light-muted)' }} className="footer-link">
                  Find Student Teammates
                </Link>
              </li>
              <li>
                <Link to="/projects/create" style={{ color: 'var(--text-light-muted)' }} className="footer-link">
                  Publish Capstone Project
                </Link>
              </li>
              <li>
                <Link to="/collaborations" style={{ color: 'var(--text-light-muted)' }} className="footer-link">
                  Collaboration Requests
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Context */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9375rem' }}>Academic Community</h4>
            <div style={{ fontSize: '0.875rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Institution:</strong> ITM SLS Baroda University</div>
              <div><strong>Campus:</strong> Paldi, near Jarod, Vadodara, Gujarat 391510</div>
              <div><strong>Target Depts:</strong> CSE, IT & Engineering Allied</div>
              <div style={{ marginTop: '0.5rem', color: '#64748B', fontSize: '0.75rem' }}>
                * Independent student capstone engineering project; not an administrative university system.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-dark)',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem'
        }}>
          <div>
            © {new Date().getFullYear()} CollabSphere. Built with React, Vite & MERN Architecture.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-light-muted)' }}>
            Developed by Nirav Gandhi with <Heart size={14} style={{ color: '#10B981', fill: '#10B981' }} /> for ITM BU
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--primary-400) !important;
          transform: translateX(2px);
        }
      `}</style>
    </footer>
  );
}
