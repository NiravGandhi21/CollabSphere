import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Github, 
  ExternalLink, 
  Users, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Send,
  UserCheck
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { collaborationService } from '../services/collaborationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import EmptyState from '../components/feedback/EmptyState';
import CollaborationModal from '../components/cards/CollaborationModal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [existingRequest, setExistingRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError('');
      try {
        const data = await projectService.getProjectById(id);
        setProject(data);

        // Check if current user has an active request
        if (user && user.id) {
          const req = await collaborationService.checkExistingRequest(id, user.id);
          setExistingRequest(req || null);
        }
      } catch (err) {
        setError(err.message || 'Project not found');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project showcase? This action cannot be undone.')) {
      return;
    }
    try {
      await projectService.deleteProject(project.id, user.id);
      addToast('Project deleted successfully.', 'info');
      navigate('/projects');
    } catch (err) {
      addToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="section-padding">
        <LoadingSpinner message="Loading showcase details..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="section-padding">
        <EmptyState
          title="Project Showcase Not Found"
          description="The requested showcase might have been removed or does not exist."
          actionLabel="Back to Projects Showcase"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  const isCreator = user && user.id === project.creatorId;
  const isMember = user && project.memberIds && project.memberIds.includes(user.id);

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Link
            to="/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}
          >
            <ArrowLeft size={16} /> Back to Projects Directory
          </Link>
        </div>

        {/* Showcase Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '1.25rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {project.category || 'Capstone Project'}
                </span>
                {project.isAcceptingMembers ? (
                  <span className="badge badge-emerald">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary-500)' }} />
                    Open for Collaboration
                  </span>
                ) : (
                  <span className="badge badge-subtle">Team Full / Not Recruiting</span>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, lineHeight: 1.2 }}>
                {project.title}
              </h1>
            </div>

            {/* Owner Actions */}
            {isCreator && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to={`/projects/${project.id}/edit`} className="btn btn-secondary btn-sm">
                  <Edit3 size={15} /> Edit Showcase
                </Link>
                <button onClick={handleDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>

          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '850px', marginBottom: '1.75rem' }}>
            {project.tagline}
          </p>

          {/* Links & Repository Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-sm"
              >
                <Github size={16} /> View Code on GitHub <ExternalLink size={13} />
              </a>
            )}
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-emerald btn-sm"
              >
                <ExternalLink size={16} /> Open Live Demo
              </a>
            )}
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {/* Main Column: Details, Problem Statement, Tech Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Problem Statement Card */}
            {project.problemStatement && (
              <div className="card">
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary-600)' }}>Problem Statement</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {project.problemStatement}
                </p>
              </div>
            )}

            {/* Comprehensive Description */}
            <div className="card">
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Architecture & Implementation Overview
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {project.description}
              </p>
            </div>

            {/* Technology Stack Matrix */}
            <div className="card">
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '1rem' }}>
                Technology Stack & Libraries
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.techStack.map((tech, idx) => (
                  <span key={idx} className="badge badge-emerald" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Creator, Roster & Collaboration Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Collaboration Action Card */}
            <div className="card" style={{
              backgroundColor: '#FFFFFF',
              border: project.isAcceptingMembers ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
              boxShadow: project.isAcceptingMembers ? 'var(--shadow-emerald)' : 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                <Users size={16} />
                TEAM COLLABORATION
              </div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {project.isAcceptingMembers ? 'Join This Project Team' : 'Team Roster Finalized'}
              </h4>

              {project.isAcceptingMembers && project.requiredRoles && (
                <div style={{
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--primary-800)',
                  marginBottom: '1rem'
                }}>
                  <strong>Roles Needed:</strong> {project.requiredRoles}
                </div>
              )}

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {project.isAcceptingMembers
                  ? 'Submit a personal pitch explaining how your skills can help bring this project to life. The lead will review and respond.'
                  : 'This project has assembled its core team and is not currently accepting additional collaborators.'}
              </p>

              {/* Action Buttons depending on user role */}
              {!isAuthenticated ? (
                <div>
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    Sign in to Request to Join
                  </Link>
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Must be registered ITM BU student
                  </div>
                </div>
              ) : isCreator ? (
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  You are the Project Lead for this showcase.
                </div>
              ) : isMember ? (
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-accepted-bg)', border: '1px solid var(--status-accepted-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--status-accepted-text)', fontWeight: 600 }}>
                  <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 4 }} />
                  You are a confirmed team member!
                </div>
              ) : existingRequest ? (
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--status-pending-text)', fontWeight: 600 }}>
                  Application {existingRequest.status}
                </div>
              ) : project.isAcceptingMembers ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Send size={16} /> Request to Join Team
                </button>
              ) : (
                <button disabled className="btn btn-secondary" style={{ width: '100%' }}>
                  Not Currently Recruiting
                </button>
              )}
            </div>

            {/* Confirmed Team Roster Card */}
            <div className="card">
              <h4 style={{ fontSize: '1.0625rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={17} style={{ color: 'var(--primary-600)' }} />
                Confirmed Team Roster ({1 + (project.members ? project.members.length : 0)})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Project Lead */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <img
                    src={project.creator?.avatar}
                    alt={project.creator?.name}
                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Link to={`/students/${project.creator?.id}`} style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {project.creator?.name}
                      </Link>
                      <span className="badge badge-dark" style={{ fontSize: '0.625rem' }}>LEAD</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {project.creator?.department}
                    </div>
                  </div>
                </div>

                {/* Accepted Collaborators */}
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Link to={`/students/${member.id}`} style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {member.name}
                          </Link>
                          <span className="badge badge-subtle" style={{ fontSize: '0.625rem' }}>MEMBER</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {member.department}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    No additional collaborators joined yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Pitch Modal */}
      {modalOpen && (
        <CollaborationModal
          project={project}
          applicant={user}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={async () => {
            const req = await collaborationService.checkExistingRequest(project.id, user.id);
            setExistingRequest(req);
          }}
        />
      )}
    </div>
  );
}
