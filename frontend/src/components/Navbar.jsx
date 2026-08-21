import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, 
  PlusCircle, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  Menu, 
  X 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-header" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Deep<span style={{ color: 'var(--accent-primary)' }}>Research</span> AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          {user ? (
            <>
              <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: isActive('/dashboard') ? '700' : '500',
                color: isActive('/dashboard') ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>

              <Link to="/history" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: isActive('/history') ? '700' : '500',
                color: isActive('/history') ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}>
                <History size={18} /> History
              </Link>

              <Link to="/new-research" className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> New Research
              </Link>
            </>
          ) : (
            <>
              <a href="#features" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Features</a>
              <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>How It Works</a>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-sm"
            title="Toggle theme"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
          </button>

          {/* User Profile Dropdown / Logout */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Sign out" style={{ padding: '0.4rem' }}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
