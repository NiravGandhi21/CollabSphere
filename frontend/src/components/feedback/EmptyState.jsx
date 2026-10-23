import React from 'react';
import { SearchX, Sparkles } from 'lucide-react';

export default function EmptyState({
  title = "No results found",
  description = "Try adjusting your search criteria or clear active filters to discover more items.",
  actionLabel,
  onAction,
  icon: Icon = SearchX
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      border: '1px dashed var(--border-light)',
      maxWidth: '560px',
      margin: '2rem auto'
    }}>
      <div style={{
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary-600)',
        marginBottom: '1.25rem'
      }}>
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: actionLabel ? '1.5rem' : 0 }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-secondary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
