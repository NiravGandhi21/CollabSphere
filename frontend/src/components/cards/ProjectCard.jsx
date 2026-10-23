import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Github, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';

export default function ProjectCard({ project }) {
  const isAccepting = project.isAcceptingMembers;

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)'
      }}
    >
      <div>
        {/* Card Header: Category & Open Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {project.category || 'Capstone Project'}
          </span>
          {isAccepting ? (
            <span className="badge badge-emerald">
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary-500)' }} />
              Seeking Teammates
            </span>
          ) : (
            <span className="badge badge-subtle">
              Team Complete
            </span>
          )}
        </div>

        {/* Project Title */}
        <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
          <Link
            to={`/projects/${project.id}`}
            style={{ color: 'var(--text-primary)' }}
            className="project-title-link"
          >
            {project.title}
          </Link>
        </h3>

        {/* Tagline */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {project.tagline}
        </p>

        {/* Tech Stack Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
          {project.techStack.slice(0, 4).map((tech, idx) => (
            <span key={idx} className="badge badge-subtle" style={{ fontSize: '0.75rem', backgroundColor: '#F8FAFC' }}>
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="badge badge-subtle" style={{ fontSize: '0.75rem' }}>
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Creator Info & Member Count */}
      <div style={{
        borderTop: '1px solid var(--border-light)',
        paddingTop: '1rem',
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Creator Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {project.creator && project.creator.avatar ? (
            <img
              src={project.creator.avatar}
              alt={project.creator.name}
              style={{ width: '1.875rem', height: '1.875rem', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '1.875rem',
              height: '1.875rem',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {project.creator && project.creator.name ? project.creator.name[0] : 'S'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {project.creator ? project.creator.name : 'Lead'}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {project.creator && project.creator.department ? project.creator.department.split(' ')[0] : 'Engineering'}
            </span>
          </div>
        </div>

        {/* Action Link */}
        <Link
          to={`/projects/${project.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--primary-600)'
          }}
          className="view-project-cta"
        >
          View <ArrowRight size={14} />
        </Link>
      </div>

      <style>{`
        .project-title-link:hover {
          color: var(--primary-600) !important;
        }
        .view-project-cta:hover {
          color: var(--primary-700) !important;
          transform: translateX(2px);
        }
      `}</style>
    </article>
  );
}
