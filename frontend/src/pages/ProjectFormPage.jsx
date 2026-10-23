import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  FolderPlus, 
  Save, 
  Eye 
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { allSkillsList } from '../data/mockUsers';
import ProjectCard from '../components/cards/ProjectCard';

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    problemStatement: '',
    description: '',
    techStack: ['React', 'Node.js'],
    githubUrl: '',
    liveDemoUrl: '',
    isAcceptingMembers: true,
    requiredRoles: 'Frontend Developer, API Engineer',
    category: 'Capstone Project'
  });

  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      addToast('Please sign in to publish or edit a project.', 'error');
      navigate('/login');
      return;
    }

    if (isEditing) {
      async function loadProjectForEdit() {
        try {
          const existing = await projectService.getProjectById(id);
          if (existing.creatorId !== user.id) {
            addToast('You are not authorized to edit this project.', 'error');
            navigate(`/projects/${id}`);
            return;
          }
          setFormData({
            title: existing.title,
            tagline: existing.tagline,
            problemStatement: existing.problemStatement || '',
            description: existing.description,
            techStack: existing.techStack || [],
            githubUrl: existing.githubUrl,
            liveDemoUrl: existing.liveDemoUrl || '',
            isAcceptingMembers: Boolean(existing.isAcceptingMembers),
            requiredRoles: existing.requiredRoles || '',
            category: existing.category || 'Capstone Project'
          });
        } catch (err) {
          addToast('Failed to load project details.', 'error');
          navigate('/projects');
        }
      }
      loadProjectForEdit();
    }
  }, [id, isEditing, isAuthenticated, user, navigate, addToast]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!formData.tagline.trim() || formData.tagline.trim().length < 10) {
      errs.tagline = 'Tagline must be at least 10 characters.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 30) {
      errs.description = 'Description must be at least 30 characters.';
    }
    if (!formData.githubUrl.trim() || !formData.githubUrl.startsWith('http')) {
      errs.githubUrl = 'Valid GitHub repository URL starting with http:// or https:// is required.';
    }
    if (formData.techStack.length === 0) {
      errs.techStack = 'Please specify at least one technology stack tag.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddTag = (tagToAdd) => {
    const tag = (tagToAdd || tagInput).trim();
    if (tag && !formData.techStack.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tag]
      }));
      setTagInput('');
      if (errors.techStack) {
        setErrors(prev => ({ ...prev, techStack: null }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        await projectService.updateProject(id, formData, user.id);
        addToast('Project showcase updated successfully!', 'success');
        navigate(`/projects/${id}`);
      } else {
        const created = await projectService.createProject(formData, user.id);
        addToast('Project showcase published successfully!', 'success');
        navigate(`/projects/${created.id}`);
      }
    } catch (err) {
      addToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Live preview mockup object
  const previewProject = {
    id: 'preview',
    title: formData.title || 'Your Project Showcase Title',
    tagline: formData.tagline || 'A compelling one-sentence summary explaining your project value...',
    category: formData.category,
    techStack: formData.techStack.length > 0 ? formData.techStack : ['React', 'Node.js'],
    isAcceptingMembers: formData.isAcceptingMembers,
    creator: user || { name: 'Student Engineer' }
  };

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-page)', minHeight: '85vh' }}>
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

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-600)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Sparkles size={14} />
            {isEditing ? 'EDIT SHOWCASE' : 'PUBLISH NEW SHOWCASE'}
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            {isEditing ? 'Update Project Showcase' : 'Publish Your Project Showcase'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Expose your capstone, side-project, or hackathon idea to the ITM BU student community.
          </p>
        </div>

        {/* 2-Column: Form & Live Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Main Form Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Capstone Project">Capstone Project</option>
                  <option value="Hackathon Entry">Hackathon Entry</option>
                  <option value="Research Prototype">Research Prototype</option>
                  <option value="Side Project / Open Source">Side Project / Open Source</option>
                </select>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Project Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g., EcoTracker — Carbon Footprint Analytics"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && <div className="form-error-msg">{errors.title}</div>}
              </div>

              {/* Tagline */}
              <div className="form-group">
                <label className="form-label" htmlFor="tagline">
                  Short Summary / Tagline <span className="required">*</span>
                </label>
                <input
                  id="tagline"
                  type="text"
                  className={`form-input ${errors.tagline ? 'error' : ''}`}
                  placeholder="e.g., A real-time telemetry dashboard to measure and offset daily campus power usage."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
                <span className="form-hint">One concise, engaging sentence (10–200 characters).</span>
                {errors.tagline && <div className="form-error-msg">{errors.tagline}</div>}
              </div>

              {/* Problem Statement */}
              <div className="form-group">
                <label className="form-label" htmlFor="problemStatement">
                  Problem Statement & Context
                </label>
                <textarea
                  id="problemStatement"
                  rows={3}
                  className="form-textarea"
                  placeholder="What specific campus, community, or technical bottleneck does this project address?"
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                />
              </div>

              {/* Full Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Technical Architecture & Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe your system architecture, data models, key algorithms, and implementation details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <div className="form-error-msg">{errors.description}</div>}
              </div>

              {/* Tech Stack Pills */}
              <div className="form-group">
                <label className="form-label">
                  Tech Stack Tags <span className="required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type a skill/tag (e.g., Docker) and press Add"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>

                {/* Selected Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                  {formData.techStack.map((tech) => (
                    <span key={tech} className="badge badge-emerald" style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}>
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tech)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-700)', cursor: 'pointer', marginLeft: 4 }}
                        aria-label={`Remove ${tech}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Quick Add Tags */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Quick add common tags:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {allSkillsList.slice(0, 10).map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleAddTag(suggested)}
                      disabled={formData.techStack.includes(suggested)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.6875rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: formData.techStack.includes(suggested) ? 'var(--bg-subtle)' : '#FFFFFF',
                        cursor: formData.techStack.includes(suggested) ? 'default' : 'pointer'
                      }}
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>
                {errors.techStack && <div className="form-error-msg">{errors.techStack}</div>}
              </div>

              {/* GitHub and Live Demo URLs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="githubUrl">
                    GitHub Repository URL <span className="required">*</span>
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    className={`form-input ${errors.githubUrl ? 'error' : ''}`}
                    placeholder="https://github.com/username/repo"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                  {errors.githubUrl && <div className="form-error-msg">{errors.githubUrl}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="liveDemoUrl">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    id="liveDemoUrl"
                    type="url"
                    className="form-input"
                    placeholder="https://myproject.vercel.app"
                    value={formData.liveDemoUrl}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Collaboration Recruitment Toggle */}
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                margin: '1.5rem 0'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isAcceptingMembers}
                    onChange={(e) => setFormData({ ...formData, isAcceptingMembers: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-500)' }}
                  />
                  <span>Actively Seeking Teammates & Collaborators</span>
                </label>

                {formData.isAcceptingMembers && (
                  <div style={{ marginTop: '1rem' }}>
                    <label className="form-label" htmlFor="requiredRoles">
                      Roles Needed (e.g., Frontend Specialist, ML Prototyper)
                    </label>
                    <input
                      id="requiredRoles"
                      type="text"
                      className="form-input"
                      placeholder="e.g., UI/UX Designer, Express API Specialist"
                      value={formData.requiredRoles}
                      onChange={(e) => setFormData({ ...formData, requiredRoles: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {isEditing ? <Save size={16} /> : <FolderPlus size={16} />}
                  {submitting ? 'Saving Showcase...' : isEditing ? 'Save Changes' : 'Publish Showcase'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Card Preview */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <Eye size={15} />
              LIVE SHOWCASE CARD PREVIEW
            </div>
            <ProjectCard project={previewProject} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
              * This is an interactive preview of how your card will appear in student discovery feeds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
