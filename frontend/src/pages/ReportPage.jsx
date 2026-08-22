import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { researchAPI, reportAPI } from '../services/api';
import { 
  Sparkles, 
  FileText, 
  Download, 
  Copy, 
  Trash2, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

export const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [followupMessage, setFollowupMessage] = useState('');
  const [asking, setAsking] = useState(false);
  const [followupList, setFollowupList] = useState([]);
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'sources'

  const loadReportData = async () => {
    try {
      setLoading(true);
      const resDetail = await researchAPI.getDetail(id);
      setDetail(resDetail.data);
      if (resDetail.data.report) {
        setReport(resDetail.data.report);
      }
      if (resDetail.data.followup_messages) {
        setFollowupList(resDetail.data.followup_messages);
      }
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [id]);

  const handleCopy = () => {
    if (!report?.content) return;
    navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    const url = reportAPI.downloadPDF(id);
    window.open(url, '_blank');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this research report?')) return;
    try {
      await researchAPI.delete(id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete research.');
    }
  };

  const handleAskFollowUp = async (e) => {
    e.preventDefault();
    if (!followupMessage.trim() || asking) return;

    const q = followupMessage.trim();
    setFollowupMessage('');
    setAsking(true);

    try {
      const res = await reportAPI.askFollowUp(id, q);
      setFollowupList((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      alert('Failed to send follow-up question.');
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading research report...</div>
      </div>
    );
  }

  if (!detail || !report) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem' }}>
        <FileText size={48} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
        <h2>Report Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
          This report does not exist or has not finished generating yet.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleCopy} className="btn btn-secondary btn-sm">
            {copied ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied Markdown' : 'Copy Report'}
          </button>

          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
            <Download size={16} /> Download PDF
          </button>

          <button onClick={handleDelete} className="btn btn-danger btn-sm">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        
        {/* Title Header */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-completed">Status: Completed</span>
            <span className="badge badge-depth">Depth: {detail.depth}</span>
            <span className="badge badge-progress">{detail.sources?.length || 0} Sources Cited</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: '800', lineHeight: '1.25', marginBottom: '0.75rem' }}>
            {report.title}
          </h1>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Topic: <strong>{detail.topic}</strong> • Conducted on {new Date(detail.created_at).toLocaleString()}
          </div>
        </div>

        {/* Executive Summary Callout */}
        {report.executive_summary && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(240, 68, 68, 0.1) 0%, rgba(240, 139, 98, 0.1) 100%)',
            border: '1px solid rgba(240, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} /> Executive Summary
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.65' }}>
              {report.executive_summary}
            </p>
          </div>
        )}

        {/* Tabs: Report vs Sources */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('report')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '700',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'report' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === 'report' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileText size={18} /> Full Research Content
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '700',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'sources' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === 'sources' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldCheck size={18} /> Verified Sources ({detail.sources?.length || 0})
          </button>
        </div>

        {/* Tab 1: Markdown Content */}
        {activeTab === 'report' && (
          <div className="markdown-body" style={{ lineHeight: '1.75', fontSize: '1rem', color: 'var(--text-primary)' }}>
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        )}

        {/* Tab 2: Sources Cards */}
        {activeTab === 'sources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {detail.sources && detail.sources.length > 0 ? (
              detail.sources.map((src, idx) => (
                <div key={src.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                      [{idx+1}] {src.title}
                    </h4>
                    <span className="badge badge-completed">
                      Quality: {intVal(src.quality_score)}/100
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0' }}>
                    Domain: <strong style={{ color: 'var(--text-secondary)' }}>{src.source_name}</strong> • Type: <strong style={{ color: 'var(--accent-primary)' }}>{src.source_type}</strong> • Published: {src.publication_date || '2026'}
                  </div>

                  {src.snippet && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', margin: '0.75rem 0' }}>
                      "{src.snippet}"
                    </p>
                  )}

                  {src.quality_metadata && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                      {src.quality_metadata}
                    </div>
                  )}

                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                    Visit Source URL <ExternalLink size={14} />
                  </a>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No source records linked to this report.</p>
            )}
          </div>
        )}

      </div>

      {/* Follow-up Questions Section */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={22} color="var(--accent-primary)" /> Follow-up Questions & Deep Dive
        </h2>

        {/* Conversation Thread */}
        {followupList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            {followupList.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* User Q */}
                <div style={{
                  alignSelf: 'flex-end',
                  background: 'rgba(240, 68, 68, 0.14)',
                  border: '1px solid rgba(240, 68, 68, 0.3)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '85%',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}>
                  {msg.user_message}
                </div>

                {/* Assistant Answer */}
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  borderRadius: '16px 16px 16px 4px',
                  maxWidth: '90%',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <div style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={14} /> AI Assistant
                  </div>
                  <ReactMarkdown>{msg.assistant_message}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAskFollowUp} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask a follow-up question (e.g. 'Explain the ethical concerns in more detail')..."
            value={followupMessage}
            onChange={(e) => setFollowupMessage(e.target.value)}
            disabled={asking}
          />
          <button type="submit" className="btn btn-primary" disabled={asking || !followupMessage.trim()}>
            {asking ? <div style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
          </button>
        </form>
      </div>

    </div>
  );
};

function intVal(num) {
  if (!num) return 80;
  return Math.round(num * 100);
}
