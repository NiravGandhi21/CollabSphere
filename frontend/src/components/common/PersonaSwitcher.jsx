import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockPersonas } from '../../data/mockSession';
import { UserCheck, ChevronUp, ChevronDown, ShieldAlert } from 'lucide-react';

export default function PersonaSwitcher() {
  const { personaKey, switchPersona, user } = useAuth();
  const { addToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleSelect = async (key) => {
    const updated = await switchPersona(key);
    const persona = mockPersonas.find(p => p.key === key);
    addToast(
      persona.userId ? `Switched role to: ${persona.label}` : 'Switched to Guest (Unauthenticated)',
      'info',
      2500
    );
  };

  return (
    <aside
      className="persona-switcher"
      aria-label="Development Role Simulator"
      style={{
        display: 'flex',
        flexDirection: collapsed ? 'row' : 'column',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: collapsed ? 'var(--radius-full)' : 'var(--radius-lg)',
        padding: collapsed ? '0.35rem 0.75rem' : '0.625rem 0.875rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#34D399', fontWeight: 700 }}>
          <UserCheck size={14} />
          <span>Dev Role Simulator:</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
            {user ? user.name.split(' ')[0] : 'Guest'}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          title={collapsed ? "Expand Dev Persona Switcher" : "Minimize Switcher"}
          aria-label={collapsed ? "Expand Dev Persona Switcher" : "Minimize Switcher"}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
          {mockPersonas.map((persona) => {
            const isActive = personaKey === persona.key;
            return (
              <button
                key={persona.key}
                onClick={() => handleSelect(persona.key)}
                className={`persona-btn ${isActive ? 'active' : ''}`}
                title={persona.description}
              >
                {persona.label}
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
