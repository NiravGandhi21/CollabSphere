import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, Check, X, Sparkles } from 'lucide-react';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/cards/ProjectCard';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import EmptyState from '../components/feedback/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';

const POPULAR_TAGS = ['React', 'Node.js', 'Python', 'MongoDB', 'Three.js', 'TailwindCSS', 'FastAPI', 'Flutter', 'IoT'];

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [openOnly, setOpenOnly] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const data = await projectService.getProjects({
          search: debouncedSearch,
          tech: selectedTech,
          openOnly
        });
        setProjects(data);
      } catch (err) {
        console.error('Failed to query projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [debouncedSearch, selectedTech, openOnly]);

  const handleTagToggle = (tag) => {
    setSelectedTech(prev => (prev === tag ? '' : tag));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTech('');
    setOpenOnly(false);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedTech || openOnly);

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-600)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Sparkles size={14} />
              STUDENT CAPSTONES & HACKATHONS
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Project Showcases</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '1rem' }}>
              Explore real-world software, robotics, and ML prototypes built by ITM BU students.
            </p>
          </div>

          {isAuthenticated && (
            <Link to="/projects/create" className="btn btn-primary">
              <PlusCircle size={16} /> Post Project Showcase
            </Link>
          )}
        </div>

        {/* Search & Filter Controls Surface */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {/* Top Row: Search Input & Open Toggle */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search projects by title, summary, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                aria-label="Search projects"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Open For Collaboration Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
              />
              <span>Seeking Teammates Only</span>
            </label>
          </div>

          {/* Bottom Row: Tech Stack Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Filter by Tech:
            </span>
            {POPULAR_TAGS.map((tag) => {
              const active = selectedTech.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`skill-pill ${active ? 'active' : ''}`}
                >
                  {tag} {active && <Check size={12} />}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
              >
                <X size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <div>
            Showing <strong>{projects.length}</strong> {projects.length === 1 ? 'project showcase' : 'project showcases'}
            {selectedTech && <span> tagged with <strong>"{selectedTech}"</strong></span>}
            {openOnly && <span> accepting teammates</span>}
          </div>
        </div>

        {/* Project Grid / Loading / Empty State */}
        {loading ? (
          <LoadingSpinner message="Searching showcases..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects match your filter"
            description="Try searching for a different framework, remove the 'Seeking Teammates' filter, or clear your search query."
            actionLabel="Clear Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
