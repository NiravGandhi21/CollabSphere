import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Users, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Code2, 
  Layers, 
  GitPullRequest 
} from 'lucide-react';
import SceneFallback from '../components/3d/SceneFallback';
import ProjectCard from '../components/cards/ProjectCard';
import { projectService } from '../services/projectService';
import LoadingSpinner from '../components/feedback/LoadingSpinner';

const SpatialNetworkCanvas = lazy(() => import('../components/3d/SpatialNetworkCanvas'));

export default function LandingPage() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const all = await projectService.getProjects();
        setFeaturedProjects(all.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div>
      {/* ===================================================================
          1. Hero Section with 3D Spatial Network
          =================================================================== */}
      <section style={{
        position: 'relative',
        backgroundColor: '#0B0F17',
        color: '#FFFFFF',
        padding: '5rem 0 6rem 0',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Radial Lighting */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(11, 15, 23, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3.5rem'
          }}>
            {/* Left: Value Proposition */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.875rem',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-full)',
                color: '#34D399',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '1.5rem'
              }}>
                <Sparkles size={14} />
                <span>ITM SLS Baroda University • Student Project Hub</span>
              </div>

              <h1 style={{
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em'
              }}>
                Connect. Collaborate. <br />
                <span style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Create. Showcase.
                </span>
              </h1>

              <p style={{
                fontSize: '1.125rem',
                color: '#94A3B8',
                lineHeight: 1.65,
                maxWidth: '540px',
                marginBottom: '2rem'
              }}>
                Turn academic capstones, hackathon ideas, and classroom prototypes into real-world software. Discover engineering peers by technical skills, pitch collaboration proposals, and build teams that deliver.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
                <Link to="/projects" className="btn btn-primary btn-lg">
                  <FolderKanban size={18} />
                  Explore Projects
                </Link>
                <Link to="/students" className="btn btn-outline-dark btn-lg">
                  <Users size={18} />
                  Find Teammates
                </Link>
              </div>

              {/* Stats Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>50+</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>Active Capstones</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399' }}>120+</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>Student Engineers</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>35+</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>Formed Squads</div>
                </div>
              </div>
            </div>

            {/* Right: 3D Interactive Spatial Canvas */}
            <div style={{ height: '440px', width: '100%', position: 'relative' }}>
              <Suspense fallback={<SceneFallback />}>
                <SpatialNetworkCanvas />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. Platform Workflows ("How CollabSphere Works")
          =================================================================== */}
      <section className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Structured Academic Collaboration
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
              How CollabSphere Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Designed to solve the bottleneck of student recruitment and showcase invisible semester work.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Code2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Publish Your Showcase</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Create a project showcase detailing the problem statement, tech stack, GitHub repository, and open roles needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Discover Complementary Skills</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Filter classmate profiles by exact skills—such as React, Python, or UI/UX—across CSE, IT, and allied engineering branches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <GitPullRequest size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Pitch & Form Squads</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Submit structured join requests with personal pitches. Once accepted by the project lead, you are listed in the verified team roster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. Featured Showcases Section
          =================================================================== */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-page)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div>
              <span style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Student Innovation
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>
                Featured Project Showcases
              </h2>
            </div>
            <Link to="/projects" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              View All Showcases <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading capstone showcases..." />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {featuredProjects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          4. Call-to-Action Banner
          =================================================================== */}
      <section style={{
        backgroundColor: '#0B0F17',
        color: '#FFFFFF',
        padding: '5rem 0',
        borderTop: '1px solid var(--border-dark)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '2.25rem', marginBottom: '1rem', fontWeight: 800 }}>
            Ready to Build Your Next Big Project?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.0625rem', lineHeight: 1.65, marginBottom: '2rem' }}>
            Join your fellow students at ITM SLS Baroda University. Showcase your code, discover talented teammates, and level up your engineering portfolio.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Student Profile
            </Link>
            <Link to="/projects" className="btn btn-outline-dark btn-lg">
              Explore Open Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
