import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, FolderKanban } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{
          width: '4.5rem',
          height: '4.5rem',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Compass size={36} />
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          The capstone showcase, student profile, or route you are looking for does not exist or has been relocated.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Return Home
          </Link>
          <Link to="/projects" className="btn btn-primary">
            <FolderKanban size={16} /> Browse Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
