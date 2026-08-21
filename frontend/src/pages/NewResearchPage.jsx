import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { researchAPI } from '../services/api';
import { 
  Sparkles, 
  Search, 
  Layers, 
  Filter, 
  FileText, 
  AlertCircle, 
  ArrowRight,
  Zap,
  BookOpen,
  Compass
} from 'lucide-react';

export const NewResearchPage = () => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('standard');
  const [sourcePreference, setSourcePreference] = useState('all');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!topic.trim() || topic.trim().length < 3) {
      setError('Please enter a research topic or question (minimum 3 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await researchAPI.create({
        topic: topic.trim(),
        depth,
        source_preference: sourcePreference,
        additional_instructions: additionalInstructions.trim() || null
      });
      
      const newResearch = res.data;
      navigate(`/progress/${newResearch.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to initiate research agent. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '1rem auto 3rem', width: '100%' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800' }}>Initiate New AI Research</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Enter your question and select research depth to launch the autonomous agent
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Research Topic Input */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} color="var(--accent-primary)" /> Research Topic / Core Question *
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="e.g. Impact of Artificial Intelligence on Healthcare Systems and Patient Privacy Outcomes"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ resize: 'vertical', fontSize: '1rem', lineHeight: '1.5' }}
              required
            />
          </div>

          {/* Research Depth Cards */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="var(--accent-primary)" /> Research Depth
            </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '0.5rem'
            }}>
              {[
                { id: 'quick', title: 'Quick Research', desc: '4 Subtopics (~30s)', icon: Zap },
                { id: 'standard', title: 'Standard Research', desc: '6 Subtopics (~60s)', icon: BookOpen },
                { id: 'deep', title: 'Deep Investigation', desc: '8 Subtopics (~90s)', icon: Compass }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setDepth(item.id)}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: depth === item.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: depth === item.id ? 'rgba(139, 92, 246, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <item.icon size={18} color={depth === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Preference Dropdown */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--accent-primary)" /> Preferred Source Domain
            </label>
            <select
              className="form-select"
              value={sourcePreference}
              onChange={(e) => setSourcePreference(e.target.value)}
            >
              <option value="all">All Trusted Sources (Academic, Govt, News, Official)</option>
              <option value="academic">Academic & Peer-Reviewed Institutions (.edu, arXiv, PubMed)</option>
              <option value="government">Government & International Regulatory Agencies (.gov, WHO, UN)</option>
              <option value="official">Official Enterprise & Organization Portals (.org, Verified)</option>
              <option value="news">Global News & Analytical Outlets (Reuters, BBC, WSJ)</option>
            </select>
          </div>

          {/* Additional Instructions */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--accent-primary)" /> Additional Instructions (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Focus specifically on developments from 2024-2026 with a emphasis on regulatory compliance"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '22px', height: '22px', border: '3px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Launching Autonomous Agent...</span>
              </div>
            ) : (
              <>Start Autonomous Research <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
