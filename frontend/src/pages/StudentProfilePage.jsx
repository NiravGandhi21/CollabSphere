import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Github, 
  Linkedin, 
  Globe, 
  Calendar, 
  ArrowLeft, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  FolderKanban, 
  X, 
  Plus 
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { allSkillsList } from '../data/mockUsers';
import ProjectCard from '../components/cards/ProjectCard';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import EmptyState from '../components/feedback/EmptyState';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, updateUserInState } = useAuth();
  const { addToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Profile Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editSkills, setEditSkills] = useState([]);
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      setError('');
      try {
        const data = await userService.getUserById(id);
        setStudent(data);
        setEditBio(data.bio || '');
        setEditHeadline(data.headline || '');
        setEditSkills(data.skills || []);
        setEditGithub(data.githubUrl || '');
        setEditLinkedin(data.linkedinUrl || '');
      } catch (err) {
        setError(err.message || 'Student profile not found');
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  const isOwner = currentUser && currentUser.id === student?.id;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile(student.id, {
        bio: editBio,
        headline: editHeadline,
        skills: editSkills,
        githubUrl: editGithub,
        linkedinUrl: editLinkedin
      });
      setStudent(prev => ({ ...prev, ...updated }));
      if (isOwner) {
        updateUserInState(updated);
      }
      addToast('Profile updated successfully!', 'success');
      setEditModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (skill) => {
    const s = (skill || skillInput).trim();
    if (s && !editSkills.includes(s)) {
      setEditSkills(prev => [...prev, s]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setEditSkills(prev => prev.filter(s => s !== skill));
  };

  if (loading) {
    return (
      <div className="section-padding">
        <LoadingSpinner message="Loading student profile..." />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="section-padding">
        <EmptyState
          title="Profile Not Found"
          description="The student profile you are looking for does not exist."
          actionLabel="Return to Directory"
          onAction={() => navigate('/students')}
        />
      </div>
    );
  }

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Link
            to="/students"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}
          >
            <ArrowLeft size={16} /> Back to Student Directory
          </Link>
        </div>

        {/* Profile Header Banner Card */}
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
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}>
            {/* Left: Avatar & Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <img
                src={student.avatar}
                alt={student.name}
                style={{
                  width: '6.5rem',
                  height: '6.5rem',
                  borderRadius: 'var(--radius-xl)',
                  objectFit: 'cover',
                  border: '3px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800 }}>
                    {student.name}
                  </h1>
                  <span className="badge badge-emerald" title="Verified ITM SLS Baroda University Student">
                    <CheckCircle2 size={13} /> Verified Student
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  <GraduationCap size={16} style={{ color: 'var(--primary-600)' }} />
                  <span>{student.department} • {student.semester}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Graduation Year: {student.graduationYear} • Joined {student.joinedDate || '2024'}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            {isOwner && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={15} /> Edit My Profile
              </button>
            )}
          </div>

          {/* Headline & Bio */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {student.headline || 'ITM SLS Baroda University Student Engineer'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '820px' }}>
              {student.bio || 'This student has not yet added a personal biography.'}
            </p>
          </div>

          {/* Social Links & Web Presence */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            {student.githubUrl && (
              <a
                href={student.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Github size={15} /> GitHub Profile
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Linkedin size={15} /> LinkedIn
              </a>
            )}
            {student.portfolioUrl && (
              <a
                href={student.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Globe size={15} /> Portfolio Website
              </a>
            )}
          </div>
        </div>

        {/* Technical Skills Matrix Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} style={{ color: 'var(--primary-600)' }} />
            Verified Technical Skills ({student.skills.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {student.skills.map((skill, idx) => (
              <span key={idx} className="badge badge-emerald" style={{ padding: '0.4rem 0.875rem', fontSize: '0.875rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Authored Projects Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderKanban size={20} style={{ color: 'var(--primary-600)' }} />
            Authored Capstones & Showcases ({student.authoredProjects ? student.authoredProjects.length : 0})
          </h3>
          {student.authoredProjects && student.authoredProjects.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {student.authoredProjects.map(proj => (
                <ProjectCard key={proj.id} project={{ ...proj, creator: student }} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
              No project showcases authored yet.
            </div>
          )}
        </div>

        {/* Member / Collaborated Projects Section */}
        {student.memberProjects && student.memberProjects.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'var(--primary-600)' }} />
              Collaborated Projects ({student.memberProjects.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {student.memberProjects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Student Profile</h2>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  className="form-input"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="e.g., Full-Stack MERN Developer & Systems Architect"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biography</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Describe your technical interests, domain passions, and hackathon experience..."
                />
              </div>

              {/* Skills Editor */}
              <div className="form-group">
                <label className="form-label">Technical Skills</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type skill and press Add"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button type="button" onClick={() => handleAddSkill()} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {editSkills.map(skill => (
                    <span key={skill} className="badge badge-emerald">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-700)', cursor: 'pointer', marginLeft: 3 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {allSkillsList.slice(0, 8).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      disabled={editSkills.includes(s)}
                      style={{ fontSize: '0.6875rem', padding: '0.15rem 0.4rem', borderRadius: 4, border: '1px solid var(--border-light)', cursor: 'pointer' }}
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Profile URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
