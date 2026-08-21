import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem' }}>
        <div style={{
          fontSize: '5rem',
          fontWeight: '900',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1',
          marginBottom: '1rem'
        }}>
          404
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          The page or research resource you are looking for does not exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={18} /> Home
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            <Home size={18} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
