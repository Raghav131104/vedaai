'use client';
import { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/lib/useWebSocket';

const STEPS = [
  { label: 'Connected to server', t: 10, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg> },
  { label: 'Building AI prompt', t: 30, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: 'Generating questions', t: 65, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { label: 'Saving to database', t: 88, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> },
  { label: 'Completed', t: 100, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg> },
];

export default function ProcessingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const jobId = searchParams.get('jobId');
  const { job } = useAssignmentStore();
  const { progress, message, status } = job;

  useWebSocket(jobId);

  useEffect(() => {
    if (status === 'completed' && job.assessmentId) {
      setTimeout(() => router.push(`/assessment/${job.assessmentId}`), 1200);
    }
  }, [status, job.assessmentId, router]);

  return (
    <div style={{minHeight:'100vh',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div className="proc-box">
        {/* Orb */}
        <div className="proc-orb">
          <div className="proc-r1"/>
          <div className="proc-r2" style={status==='completed'?{borderTopColor:'#22c55e',animationDuration:'0s'}:{}}/>
          <div className="proc-r3">
            {status === 'completed'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            }
          </div>
        </div>

        <div style={{fontSize:'1.1rem',fontWeight:700,marginBottom:7,color:'#1a1a1a'}}>
          {status === 'completed' ? 'Paper Ready!' : status === 'failed' ? 'Generation Failed' : 'Generating Paper'}
        </div>
        <div style={{fontSize:'.8rem',color:'#888',marginBottom:22}}>{message || 'Processing...'}</div>

        {/* Progress */}
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:'#888',marginBottom:6}}>
          <span>Progress</span><span>{progress}%</span>
        </div>
        <div className="proc-track">
          <div className="proc-fill-bar" style={{width:`${progress}%`}}/>
        </div>

        {/* Steps */}
        <div className="proc-steps-box">
          {STEPS.map((s, i) => {
            const done = progress >= s.t;
            const active = !done && progress >= (STEPS[i-1]?.t ?? 0);
            const cls = done ? 'done' : active ? 'active' : 'idle';
            return (
              <div key={i} className="p-step">
                <div className={`p-step-icon ${cls}`}>{s.icon}</div>
                <span className={`p-step-text ${cls}`}>{s.label}</span>
                {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            );
          })}
        </div>
        <div style={{textAlign:'center',fontSize:'.62rem',color:'#ccc',marginTop:14,fontFamily:'monospace'}}>ID: {assignmentId}</div>
      </div>
    </div>
  );
}
