import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { researchAPI } from '../services/api';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Search, 
  BrainCircuit, 
  FileText, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const ProgressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState({
    status: 'pending',
    progress_percentage: 5,
    current_step: 'Initializing research agent...',
    completed: false,
    error: null
  });
  const [researchInfo, setResearchInfo] = useState(null);

  useEffect(() => {
    // Initial fetch of research metadata
    const fetchInfo = async () => {
      try {
        const res = await researchAPI.getDetail(id);
        setResearchInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch research detail:", err);
      }
    };
    fetchInfo();
  }, [id]);

  useEffect(() => {
    // Poll progress every 2 seconds until completed or failed
    let timer = null;

    const checkProgress = async () => {
      try {
        const res = await researchAPI.getProgress(id);
        const data = res.data;
        setProgressData(data);

        if (data.completed) {
          if (data.status === 'completed') {
            // Auto navigate to report after short pause
            setTimeout(() => {
              navigate(`/report/${id}`);
            }, 1200);
          }
        } else {
          timer = setTimeout(checkProgress, 2000);
        }
      } catch (err) {
        console.error("Error polling research progress:", err);
        timer = setTimeout(checkProgress, 3000);
      }
    };

    checkProgress();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [id, navigate]);

  // Steps checklist calculation based on progress percentage
  const steps = [
    { title: 'Understanding your research question & key intent', minProgress: 15, icon: BrainCircuit },
    { title: 'Creating structured research plan & subtopics', minProgress: 30, icon: Cpu },
    { title: 'Searching verified academic, govt & news sources', minProgress: 50, icon: Search },
    { title: 'Collecting source metadata & evaluating authority', minProgress: 65, icon: ShieldCheck },
    { title: 'Analyzing findings & synthesizing empirical evidence', minProgress: 80, icon: Sparkles },
    { title: 'Generating structured Markdown report with inline citations', minProgress: 95, icon: FileText }
  ];

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--gradient-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={28} color="#ffffff" className={progressData.completed ? '' : 'animate-spin'} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {progressData.completed 
              ? (progressData.status === 'completed' ? 'Research Completed!' : 'Research Failed') 
              : 'Autonomous AI Research Agent at Work'}
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            {researchInfo ? `"${researchInfo.topic}"` : 'Processing topic analysis and source collection...'}
          </p>
        </div>

        {/* Error Banner */}
        {progressData.error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={22} />
            <div>
              <div style={{ fontWeight: '700' }}>Research Error</div>
              <div style={{ fontSize: '0.9rem' }}>{progressData.error}</div>
            </div>
          </div>
        )}

        {/* Progress Bar Container */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--accent-primary)' }}>{progressData.current_step}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{progressData.progress_percentage}%</span>
          </div>

          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressData.progress_percentage}%`,
              height: '100%',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Live Step Tracker Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((step, idx) => {
            const isDone = progressData.progress_percentage >= step.minProgress;
            const isCurrent = !isDone && (idx === 0 || progressData.progress_percentage >= steps[idx-1].minProgress);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: isDone 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : isCurrent 
                    ? 'rgba(240, 68, 68, 0.12)'
                    : 'rgba(15, 23, 42, 0.3)',
                  border: isCurrent 
                    ? '1px solid var(--accent-primary)' 
                    : isDone 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : '1px solid var(--border-color)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                    background: isDone ? 'rgba(98, 196, 156, 0.2)' : isCurrent ? 'rgba(240, 68, 68, 0.2)' : 'var(--surface-soft)',
                  color: isDone ? 'var(--accent-emerald)' : isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}>
                  {isDone ? (
                    <CheckCircle2 size={18} />
                  ) : isCurrent ? (
                    <div style={{ width: '14px', height: '14px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Clock size={16} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: isCurrent || isDone ? '700' : '500',
                    color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontSize: '0.95rem'
                  }}>
                    {step.title}
                  </div>
                </div>

                {isDone && (
                  <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Completed Direct Link */}
        {progressData.completed && progressData.status === 'completed' && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to={`/report/${id}`} className="btn btn-primary btn-lg">
              View Generated Research Report <ArrowRight size={20} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
