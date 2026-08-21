import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { researchAPI } from '../services/api';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  PlusCircle, 
  Sparkles, 
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const HistoryPage = () => {
  const navigate = useNavigate();

  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [depthFilter, setDepthFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (depthFilter) params.depth = depthFilter;
      if (sortBy) params.sort_by = sortBy;

      const res = await researchAPI.list(params);
      setResearches(res.data);
    } catch (err) {
      console.error("Error fetching research history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter, depthFilter, sortBy]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this research?')) return;
    try {
      await researchAPI.delete(id);
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to delete research item.');
    }
  };

  const handleOpen = (item) => {
    if (item.status === 'completed') {
      navigate(`/report/${item.id}`);
    } else {
      navigate(`/progress/${item.id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title & CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800' }}>Research History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Filter, search, and manage all past autonomous research reports.
          </p>
        </div>

        <Link to="/new-research" className="btn btn-primary">
          <PlusCircle size={18} /> New Research
        </Link>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search research topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="analyzing">Analyzing / Progress</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Depth Filter */}
          <div>
            <select
              className="form-select"
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value)}
            >
              <option value="">All Depths</option>
              <option value="quick">Quick Research</option>
              <option value="standard">Standard Research</option>
              <option value="deep">Deep Investigation</option>
            </select>
          </div>

          {/* Date Sort */}
          <div>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Sort: Newest First</option>
              <option value="date_asc">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading history items...
          </div>
        ) : researches.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Sparkles size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3>No matching research records found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>
              Try adjusting your search query or filters.
            </p>
            <Link to="/new-research" className="btn btn-primary">
              <PlusCircle size={18} /> Start Research
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {researches.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpen(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
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
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    {item.topic}
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{item.source_count || 0} Sources</span>
                    {item.additional_instructions && (
                      <>
                        <span>•</span>
                        <span>Instructions: {item.additional_instructions}</span>
                      </>
                    )}
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
                    style={{ padding: '0.45rem', color: 'var(--accent-rose)' }}
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
