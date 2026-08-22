import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  FileText, 
  CheckCircle2, 
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  Database,
  BrainCircuit,
  Zap
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '5rem 1rem 3rem',
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div className="badge badge-depth" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
          <Sparkles size={14} /> Autonomous AI Research Agent 2.0
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          background: 'linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Research Smarter with <span style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>AI</span>
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          Transform complex questions into structured, source-backed research reports in minutes. Autonomous search, transparent source evaluation, and inline citations.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Research <ArrowRight size={20} />
          </Link>
          <a href="#features" className="btn btn-secondary btn-lg">
            View Features
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem' }}>How It Works</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Autonomous 7-step research workflow from query to cited report</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { step: '01', title: 'Query Analysis', desc: 'Agent deconstructs topic into core intents, keywords, and target research parameters.', icon: BrainCircuit },
            { step: '02', title: 'Research Planning', desc: 'Generates customized multi-part plan tailored to selected research depth (Quick, Standard, Deep).', icon: Layers },
            { step: '03', title: 'Source Search & Filtering', desc: 'Queries verified search databases for academic, governmental, news, and official sources.', icon: Search },
            { step: '04', title: 'Credibility Evaluation', desc: 'Grades source domain authority, HTTPS security, and content relevance with transparent scores.', icon: ShieldCheck },
            { step: '05', title: 'Synthesis & Cited Report', desc: 'Aggregates empirical findings and generates formatted Markdown reports with inline footnotes.', icon: FileText },
            { step: '06', title: 'Follow-up Context Q&A', desc: 'Interactively explore deeper questions without repeating full search procedures.', icon: MessageSquare }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ position: 'relative', padding: '2rem' }}>
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--text-muted)',
                opacity: 0.3
              }}>
                {item.step}
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(240, 68, 68, 0.13)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <item.icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem' }}>Built for Serious Research</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enterprise features designed for accurate, citation-backed intelligence</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <div className="glass-card">
            <ShieldCheck size={32} color="var(--accent-emerald)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Transparent Source Scores</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Every source is evaluated on domain authority (.edu, .gov, peer-reviewed), HTTPS status, and content freshness. You judge the quality.
            </p>
          </div>

          <div className="glass-card">
            <Zap size={32} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Structured PDF Downloads</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Export complete reports into publication-ready PDF documents complete with executive summaries, table of contents, and references.
            </p>
          </div>

          <div className="glass-card">
            <Database size={32} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Persistent Research History</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              All past research runs, synthesized subtopics, and generated reports are stored securely in your dashboard for immediate reference.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-card" style={{
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, rgba(240, 68, 68, 0.16) 0%, rgba(240, 139, 98, 0.12) 100%)',
        borderColor: 'rgba(240, 68, 68, 0.32)'
      }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1rem' }}>Ready to Conduct Deep AI Research?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Join researchers, engineers, and analysts leveraging autonomous AI to transform complex topics into structured reports.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ArrowRight size={20} />
        </Link>
      </section>

    </div>
  );
};
