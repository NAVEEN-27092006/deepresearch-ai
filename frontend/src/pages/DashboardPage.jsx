import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, researchAPI } from '../services/api';
import { 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Trash2, 
  ExternalLink,
  Sparkles,
  BarChart3,
  BookOpen
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_research: 0,
    completed_research: 0,
    in_progress: 0,
    saved_reports: 0,
    recent_researches: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this research report?')) return;
    try {
      await researchAPI.delete(id);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Failed to delete research.');
    }
  };

  const handleOpenResearch = (item) => {
    if (item.status === 'completed') {
      navigate(`/report/${item.id}`);
    } else {
      navigate(`/progress/${item.id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800' }}>
            Welcome back, <span style={{ color: 'var(--accent-primary)' }}>{user?.name || 'Researcher'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your AI research activity overview and recent reports.
          </p>
        </div>

        <Link to="/new-research" className="btn btn-primary btn-lg">
          <PlusCircle size={20} /> New Research
        </Link>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(240, 68, 68, 0.14)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Research</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.total_research}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Completed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.completed_research}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>In Progress</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.in_progress}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Saved Reports</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.saved_reports}</div>
          </div>
        </div>
      </div>

      {/* Recent Research Section */}
      <div className="glass-card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--accent-primary)" /> Recent Research Projects
          </h2>
          <Link to="/history" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
            View All History &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading research history...
          </div>
        ) : stats.recent_researches.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)'
          }}>
            <Sparkles size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>No research runs yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Start your first autonomous AI research query to generate source-backed reports.
            </p>
            <Link to="/new-research" className="btn btn-primary">
              <PlusCircle size={18} /> Start Your First Research
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats.recent_researches.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenResearch(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    {item.topic}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{item.source_count || 0} Sources</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${item.status === 'completed' ? 'badge-completed' : item.status === 'failed' ? 'badge-failed' : 'badge-progress'}`}>
                    {item.status}
                  </span>

                  <span className="badge badge-depth">
                    {item.depth}
                  </span>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem', color: 'var(--accent-rose)' }}
                    title="Delete research"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
