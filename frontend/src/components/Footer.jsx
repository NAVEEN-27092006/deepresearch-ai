import React from 'react';
import { Sparkles, Shield, Cpu, BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}>
        {/* Brand info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: '800' }}>
              Deep<span style={{ color: 'var(--accent-primary)' }}>Research</span> AI
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Autonomous AI research agent platform transforming complex questions into structured, source-backed reports.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><a href="/new-research">Start Research</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/history">Research History</a></li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Capabilities</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li>Autonomous Web Search</li>
            <li>Transparent Citation Evaluation</li>
            <li>Interactive Follow-up Q&A</li>
            <li>PDF Export Generation</li>
          </ul>
        </div>

        {/* Security */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Security & AI</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            JWT encrypted sessions, zero hard-coded credentials, and multi-model AI abstraction layer.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div>&copy; {new Date().getFullYear()} DeepResearch AI. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Standards</span>
        </div>
      </div>
    </footer>
  );
};
