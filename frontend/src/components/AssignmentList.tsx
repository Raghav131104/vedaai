'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { Assignment } from '@/types';

export default function AssignmentList({ onCreateClick }: { onCreateClick: () => void }) {
  const { assignments, fetchAssignments } = useAssignmentStore();
  const router = useRouter();
  const [openCtx, setOpenCtx] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignments();
    const iv = setInterval(fetchAssignments, 10000);
    return () => clearInterval(iv);
  }, []);

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleClick = (a: Assignment) => {
    if (a.status === 'completed' && a.assessmentId) router.push(`/assessment/${a.assessmentId}`);
    else if (a.status === 'processing' && a.jobId) router.push(`/processing/${a._id}?jobId=${a.jobId}`);
  };

  const toggleCtx = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenCtx(prev => prev === id ? null : id);
  };

  useEffect(() => {
    const handler = () => setOpenCtx(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (assignments.length === 0) {
    return (
      <div className="empty-state">
        <div style={{marginBottom:22}}>
          <svg viewBox="0 0 220 190" fill="none" style={{width:190,height:165}}>
            <circle cx="110" cy="95" r="76" fill="#e8e8e8"/>
            <rect x="76" y="32" width="72" height="94" rx="6" fill="white" stroke="#d4d4d4" strokeWidth="1.5"/>
            <rect x="76" y="32" width="72" height="15" rx="5" fill="#4a4a4a"/>
            <rect x="86" y="56" width="42" height="4" rx="2" fill="#d0d0d0"/>
            <rect x="86" y="65" width="34" height="4" rx="2" fill="#ddd"/>
            <rect x="86" y="74" width="38" height="4" rx="2" fill="#ddd"/>
            <circle cx="124" cy="116" r="32" fill="white" stroke="#d4d4d4" strokeWidth="2"/>
            <circle cx="117" cy="109" r="19" fill="#f0f0f0" stroke="#d4d4d4" strokeWidth="1.5"/>
            <circle cx="117" cy="109" r="13" fill="#fee2e2"/>
            <line x1="111" y1="103" x2="123" y2="115" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="123" y1="103" x2="111" y2="115" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="131" y1="123" x2="147" y2="138" stroke="#aaa" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="160" cy="92" r="4.5" fill="#3b82f6" opacity=".55"/>
          </svg>
        </div>
        <div style={{fontSize:'.95rem',fontWeight:700,marginBottom:8}}>No assignments yet</div>
        <div style={{fontSize:'.8rem',color:'#888',maxWidth:340,lineHeight:1.65,marginBottom:22}}>
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
        </div>
        <button className="empty-btn" onClick={onCreateClick}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Create Your First Assignment
        </button>
      </div>
    );
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="status-dot"/>
          <span className="page-title">Assignments</span>
        </div>
        <span className="page-subtitle">Manage and create assignments for your classes.</span>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <button style={{display:'flex',alignItems:'center',gap:5,padding:'5px 11px',border:'1px solid #e0e0e0',borderRadius:6,background:'white',fontSize:'.76rem',color:'#555',cursor:'pointer',fontFamily:'inherit'}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filter By
        </button>
        <div style={{flex:1,maxWidth:260,marginLeft:'auto',position:'relative'}}>
          <div style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#888'}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input style={{width:'100%',padding:'6px 10px 6px 30px',border:'1px solid #e0e0e0',borderRadius:6,fontSize:'.76rem',color:'#1a1a1a',background:'white',outline:'none',fontFamily:'inherit'}}
            placeholder="Search Assignment" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Cards */}
      <div className="assign-scroll">
        <div className="assign-grid">
          {filtered.map((a, i) => {
            const asgn = new Date(a.createdAt).toLocaleDateString('en-GB').replace(/\//g,'-');
            const due = new Date(a.dueDate).toLocaleDateString('en-GB').replace(/\//g,'-');
            return (
              <div key={a._id} className="a-card fade-up" style={{animationDelay:`${i*.04}s`}} onClick={() => handleClick(a)}>
                <div className="a-card-top">
                  <div className="a-card-title">{a.title}</div>
                  <div style={{width:22,height:22,borderRadius:4,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#888',flexShrink:0}}
                    onClick={e => toggleCtx(e, a._id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
                  </div>
                  <div className={`ctx-menu ${openCtx === a._id ? 'open' : ''}`}>
                    <div className="ctx-item" onClick={e => { e.stopPropagation(); handleClick(a); }}>View Assignment</div>
                    <div className="ctx-item danger" onClick={e => { e.stopPropagation(); /* delete */ setOpenCtx(null); }}>Delete</div>
                  </div>
                </div>
                <div className="a-card-foot">
                  <span>Assigned on : <strong>{asgn}</strong></span>
                  <span>Due : <strong>{due}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <div className="fab-row">
        <button className="fab-btn" onClick={onCreateClick}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Create Assignment
        </button>
      </div>
    </div>
  );
}
