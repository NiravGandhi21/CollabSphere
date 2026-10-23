import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Send, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  FolderKanban 
} from 'lucide-react';
import { collaborationService } from '../services/collaborationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import EmptyState from '../components/feedback/EmptyState';

export default function CollaborationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      setLoading(true);
      try {
        const [incoming, outgoing] = await Promise.all([
          collaborationService.getRequestsForCreator(user.id),
          collaborationService.getRequestsForApplicant(user.id)
        ]);
        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
      } catch (err) {
        console.error('Failed to load collaboration inboxes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isAuthenticated]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    setProcessingId(requestId);
    try {
      await collaborationService.updateRequestStatus(requestId, newStatus, user.id);
      addToast(
        newStatus === 'Accepted'
          ? 'Collaborator accepted! They have been added to the confirmed team roster.'
          : 'Request declined.',
        newStatus === 'Accepted' ? 'success' : 'info'
      );

      // Refresh in-memory list
      setIncomingRequests(prev =>
        prev.map(r => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      addToast(err.message || 'Failed to update request status.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="section-padding" style={{ minHeight: '80vh' }}>
        <EmptyState
          title="Sign in Required"
          description="Please sign in or register with your ITM BU student account to access your collaboration request inbox."
          actionLabel="Sign In"
          onAction={() => window.location.href = '/login'}
          icon={Inbox}
        />
      </div>
    );
  }

  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-600)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Sparkles size={14} />
            TEAM FORMATION WORKFLOWS
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Collaboration Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '1rem' }}>
            Review incoming student pitches for your projects and track applications you have sent.
          </p>
        </div>

        {/* Dual Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-light)',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.9375rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'incoming' ? '3px solid var(--primary-500)' : '3px solid transparent',
              color: activeTab === 'incoming' ? 'var(--primary-600)' : 'var(--text-secondary)',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Inbox size={17} />
            <span>Lead Inbox (Incoming Pitches)</span>
            {pendingIncomingCount > 0 && (
              <span className="badge badge-pending" style={{ fontSize: '0.6875rem' }}>
                {pendingIncomingCount} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.9375rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'outgoing' ? '3px solid var(--primary-500)' : '3px solid transparent',
              color: activeTab === 'outgoing' ? 'var(--primary-600)' : 'var(--text-secondary)',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Send size={17} />
            <span>My Applications (Sent)</span>
            <span className="badge badge-subtle" style={{ fontSize: '0.6875rem' }}>
              {outgoingRequests.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner message="Loading collaboration inboxes..." />
        ) : activeTab === 'incoming' ? (
          /* ===================================================================
             Tab 1: Incoming Requests for Project Leads
             =================================================================== */
          <div>
            {incomingRequests.length === 0 ? (
              <EmptyState
                title="Your Lead Inbox is Empty"
                description="When students browse your project showcases and click 'Request to Join', their pitches will appear here for review."
                icon={Inbox}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {incomingRequests.map((req) => {
                  const isPending = req.status === 'Pending';
                  const isAccepted = req.status === 'Accepted';
                  const isDeclined = req.status === 'Declined';

                  return (
                    <article
                      key={req.id}
                      className="card"
                      style={{
                        padding: '1.75rem',
                        borderLeft: isPending ? '4px solid #F59E0B' : isAccepted ? '4px solid #10B981' : '4px solid #EF4444'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        {/* Target Project Title */}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Application to Join Showcase:
                          </div>
                          <Link
                            to={`/projects/${req.project?.id}`}
                            style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}
                          >
                            {req.project?.title}
                          </Link>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && <span className="badge badge-pending"><Clock size={12} /> Awaiting Review</span>}
                          {isAccepted && <span className="badge badge-accepted"><CheckCircle2 size={12} /> Accepted (On Roster)</span>}
                          {isDeclined && <span className="badge badge-declined"><XCircle size={12} /> Declined</span>}
                        </div>
                      </div>

                      {/* Applicant Profile Snapshot */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.25rem'
                      }}>
                        <img
                          src={req.applicant?.avatar}
                          alt={req.applicant?.name}
                          style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Link to={`/students/${req.applicant?.id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                              {req.applicant?.name}
                            </Link>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ({req.applicant?.semester})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <GraduationCap size={14} />
                            {req.applicant?.department}
                          </div>
                          {/* Applicant Skills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.375rem' }}>
                            {req.applicant?.skills?.slice(0, 5).map((s, idx) => (
                              <span key={idx} className="badge badge-subtle" style={{ fontSize: '0.6875rem' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pitch Message Content */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          Pitch & Proposed Contribution:
                        </div>
                        <p style={{
                          fontSize: '0.9375rem',
                          color: 'var(--text-primary)',
                          lineHeight: 1.6,
                          backgroundColor: '#FFFFFF',
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)'
                        }}>
                          "{req.pitchMessage}"
                        </p>
                      </div>

                      {/* Action Buttons for Lead */}
                      {isPending ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'Declined')}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#EF4444' }}
                            disabled={processingId === req.id}
                          >
                            <X size={15} /> Decline
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'Accepted')}
                            className="btn btn-primary btn-sm"
                            disabled={processingId === req.id}
                          >
                            <Check size={15} />
                            {processingId === req.id ? 'Updating...' : 'Accept Teammate'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                          Decision recorded • {isAccepted ? 'Collaborator is now visible on public project roster' : 'Application closed'}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ===================================================================
             Tab 2: Outgoing Requests Submitted by Student
             =================================================================== */
          <div>
            {outgoingRequests.length === 0 ? (
              <EmptyState
                title="No Applications Submitted"
                description="You haven't requested to join any project teams yet. Browse open showcases and pitch your skills!"
                actionLabel="Explore Projects"
                onAction={() => window.location.href = '/projects'}
                icon={Send}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {outgoingRequests.map((req) => (
                  <article key={req.id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      marginBottom: '0.875rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Applied to Project Showcase:
                        </div>
                        <Link to={`/projects/${req.project?.id}`} style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {req.project?.title}
                        </Link>
                      </div>

                      <div>
                        {req.status === 'Pending' && <span className="badge badge-pending"><Clock size={12} /> Pending Review</span>}
                        {req.status === 'Accepted' && <span className="badge badge-accepted"><CheckCircle2 size={12} /> Confirmed on Team</span>}
                        {req.status === 'Declined' && <span className="badge badge-declined"><XCircle size={12} /> Declined</span>}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                      <strong>Your Submitted Pitch:</strong> "{req.pitchMessage}"
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Submitted on {new Date(req.createdAt).toLocaleDateString()}</span>
                      <Link to={`/projects/${req.project?.id}`} style={{ color: 'var(--primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View Showcase <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
