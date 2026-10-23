import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Github, ExternalLink } from 'lucide-react';

export default function StudentCard({ student }) {
  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        {/* Avatar & Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <img
            src={student.avatar}
            alt={student.name}
            style={{
              width: '3.75rem',
              height: '3.75rem',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'cover',
              border: '2px solid var(--border-light)',
              boxShadow: 'var(--shadow-xs)'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Link to={`/students/${student.id}`} style={{ color: 'var(--text-primary)' }} className="student-title-link">
                {student.name}
              </Link>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
              <GraduationCap size={13} style={{ color: 'var(--primary-600)' }} />
              <span>{student.department}</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              {student.semester} • Class of {student.graduationYear}
            </div>
          </div>
        </div>

        {/* Headline */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {student.headline || 'ITM SLS Baroda University Student Engineer'}
        </p>

        {/* Top Skill Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
          {student.skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
              {skill}
            </span>
          ))}
          {student.skills.length > 4 && (
            <span className="badge badge-subtle" style={{ fontSize: '0.6875rem' }}>
              +{student.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div style={{
        borderTop: '1px solid var(--border-light)',
        paddingTop: '0.875rem',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {student.githubUrl && (
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)' }}
              title="GitHub Profile"
              aria-label={`${student.name}'s GitHub Profile`}
            >
              <Github size={16} />
            </a>
          )}
        </div>

        <Link
          to={`/students/${student.id}`}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
        >
          View Profile <ArrowRight size={12} />
        </Link>
      </div>

      <style>{`
        .student-title-link:hover {
          color: var(--primary-600) !important;
        }
      `}</style>
    </article>
  );
}
