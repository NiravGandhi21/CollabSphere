import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, Users, Sparkles } from 'lucide-react';
import { userService } from '../services/userService';
import { allSkillsList } from '../data/mockUsers';
import StudentCard from '../components/cards/StudentCard';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import EmptyState from '../components/feedback/EmptyState';
import { useDebounce } from '../hooks/useDebounce';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical & Mechatronics'
];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  const debouncedSearch = useDebounce(searchQuery, 250);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const data = await userService.getUsers({
          search: debouncedSearch,
          skill: selectedSkill,
          department: selectedDept === 'All Departments' ? '' : selectedDept
        });
        setStudents(data);
      } catch (err) {
        console.error('Failed to query student directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [debouncedSearch, selectedSkill, selectedDept]);

  const handleSkillToggle = (skill) => {
    setSelectedSkill(prev => (prev === skill ? '' : skill));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSkill('');
    setSelectedDept('All Departments');
  };

  const hasActiveFilters = Boolean(searchQuery || selectedSkill || selectedDept !== 'All Departments');

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-600)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Sparkles size={14} />
            PEER DIRECTORY & SKILL MATCHING
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Student Engineers</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '1rem' }}>
            Find students with complementary programming, design, and hardware skills across ITM SLS Baroda University.
          </p>
        </div>

        {/* Filter Controls Surface */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {/* Top Row: Search & Department Select */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
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
                placeholder="Search students by name, headline, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                aria-label="Search student directory"
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

            {/* Department Dropdown */}
            <div>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                aria-label="Filter by department"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Skill Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Filter by Skill:
            </span>
            {allSkillsList.slice(0, 10).map((skill) => {
              const active = selectedSkill.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`skill-pill ${active ? 'active' : ''}`}
                >
                  {skill} {active && <Check size={12} />}
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
        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{students.length}</strong> {students.length === 1 ? 'student profile' : 'student profiles'}
          {selectedSkill && <span> skilled in <strong>"{selectedSkill}"</strong></span>}
          {selectedDept !== 'All Departments' && <span> in <strong>{selectedDept}</strong></span>}
        </div>

        {/* Student Cards Grid / Loading / Empty */}
        {loading ? (
          <LoadingSpinner message="Searching student directory..." />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students match your filter"
            description="Try selecting a different skill or clear your search terms to view all registered students."
            actionLabel="Reset Filters"
            onAction={clearAllFilters}
            icon={Users}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
