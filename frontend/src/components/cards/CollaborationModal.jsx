import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import { useToast } from '../../context/ToastContext';

export default function CollaborationModal({ project, applicant, isOpen, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [pitchMessage, setPitchMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !project) return null;

  const charCount = pitchMessage.length;
  const isValidLength = charCount >= 20 && charCount <= 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidLength) {
      setError('Pitch message must be between 20 and 500 characters.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await collaborationService.submitRequest(project.id, pitchMessage, applicant.id);
      addToast('Collaboration request sent successfully! The project lead has been notified.', 'success');
      setPitchMessage('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Sparkles size={14} />
              COLLABORATION APPLICATION
            </div>
            <h2 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Join {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Project Target Info */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem',
          marginBottom: '1.25rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <strong>Project Lead:</strong> {project.creator?.name || 'Lead'}
          </div>
          {project.requiredRoles && (
            <div style={{ color: 'var(--text-secondary)' }}>
              <strong>Seeking:</strong> {project.requiredRoles}
            </div>
          )}
        </div>

        {/* Pitch Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pitchMessage" className="form-label">
              Your Pitch & Contribution Proposal <span className="required">*</span>
            </label>
            <p className="form-hint" style={{ marginBottom: '0.5rem' }}>
              Briefly describe your relevant skills, past experience, and why you want to build this project with the team.
            </p>
            <textarea
              id="pitchMessage"
              rows={5}
              className={`form-textarea ${error ? 'error' : ''}`}
              placeholder="e.g., Hi team! I am experienced in React and REST APIs. I would love to build the frontend dashboard and help optimize the component rendering..."
              value={pitchMessage}
              onChange={(e) => {
                setPitchMessage(e.target.value);
                if (error) setError('');
              }}
              disabled={submitting}
            />

            {/* Character Counter & Validation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.75rem' }}>
              <span style={{ color: isValidLength ? 'var(--primary-600)' : 'var(--text-muted)' }}>
                {charCount} / 500 characters {charCount < 20 ? `(minimum 20 required, ${20 - charCount} more needed)` : '✓'}
              </span>
            </div>

            {error && (
              <div className="form-error-msg" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !isValidLength}
            >
              <Send size={15} />
              {submitting ? 'Submitting Application...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
