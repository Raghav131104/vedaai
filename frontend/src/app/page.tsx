'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentList from '@/components/AssignmentList';
import SchoolSettingsPanel from '@/components/SchoolSettings';

type View = 'create' | 'list' | 'settings';

const SVG = {
  logo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20L12 4L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/><path d="M7 14H17" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  home: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  assign: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  notif: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chev: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  star: <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  grid: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  doc: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  gear: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  school: <svg width="18" height="18" viewBox="0 0 36 36" fill="none"><path d="M18 10l-8 5v2l8 5 8-5v-2l-8-5z" fill="white"/><path d="M10 17v5c0 2.5 3.6 4.5 8 4.5s8-2 8-4.5v-5" fill="white" opacity=".6"/></svg>,
  ham: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  lib: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  ai: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  back: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
};

export default function HomePage() {
  const router = useRouter();
  const { submitAssignment, assignments, fetchSchoolSettings, schoolSettings } = useAssignmentStore();
  const [view, setView] = useState<View>('create');
  const [openCtx, setOpenCtx] = useState<string | null>(null);

  useEffect(() => {
    fetchSchoolSettings();
    document.addEventListener('click', () => setOpenCtx(null));
    return () => document.removeEventListener('click', () => setOpenCtx(null));
  }, []);

  const handleSubmit = async () => {
    try {
      await submitAssignment();
      const s = useAssignmentStore.getState();
      if (s.job.jobId && s.submittedAssignmentId) {
        router.push(`/processing/${s.submittedAssignmentId}?jobId=${s.job.jobId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create assignment');
    }
  };

  const topbarBc = view === 'create' ? 'Assignment' : view === 'list' ? 'Assignments' : 'Settings';

  return (
    <div className="app-shell">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">{SVG.logo}</div>
          <span className="sb-logo-text">VedaAI</span>
        </div>

        {/* Create button */}
        <button className="sb-create-btn" onClick={() => setView('create')}>
          <span style={{width:16,height:16,borderRadius:'50%',background:'linear-gradient(135deg,#ff9a4d,#e84c1e)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{SVG.star}</span>
          Create Assignment
        </button>

        <div className="sb-divider"/>

        {/* Nav */}
        <nav>
          {[
            { id: 'home', label: 'Home', icon: SVG.home, onClick: () => {} },
            { id: 'groups', label: 'My Groups', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>, onClick: () => {} },
            { id: 'list', label: 'Assignments', icon: SVG.assign, onClick: () => setView('list'), badge: assignments.length > 0 ? assignments.length : null },
            { id: 'toolkit', label: "AI Teacher's Toolkit", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, onClick: () => {} },
            { id: 'settings', label: 'Settings', icon: SVG.settings, onClick: () => setView('settings') },
          ].map(item => (
            <div
              key={item.id}
              className={`sb-nav-item ${view === item.id ? 'active' : ''}`}
              onClick={item.onClick}
            >
              {item.icon}
              {item.label}
              {item.badge && <span className="sb-nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{flex:1}}/>

        {/* Bottom */}
        <div style={{padding:'10px 2px 0',borderTop:'1px solid #e0e0e0'}}>
          <div className="sb-nav-item" style={{marginBottom:8}} onClick={() => setView('settings')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2"/></svg>
            Settings
          </div>
          <div style={{display:'flex',alignItems:'center',gap:9,background:'#f7f7f7',borderRadius:10,padding:'9px 10px',cursor:'pointer'}} onClick={() => setView('settings')}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#ff9a4d,#e84c1e)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{SVG.school}</div>
            <div>
              <div style={{fontSize:'.76rem',fontWeight:600,color:'#1a1a1a'}}>{schoolSettings.schoolName || 'Delhi Public School'}</div>
              <div style={{fontSize:'.68rem',color:'#888'}}>{schoolSettings.schoolLocation || 'Bokaro Steel City'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">

        {/* Mobile topbar */}
        <div className="m-topbar" style={{display:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <div style={{width:27,height:27,borderRadius:7,background:'linear-gradient(145deg,#ff7040,#e84c1e)',display:'flex',alignItems:'center',justifyContent:'center'}}>{SVG.logo}</div>
            <span style={{fontSize:'.95rem',fontWeight:700}}>VedaAI</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{position:'relative',width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            {SVG.notif}
            <div className="tb-notif-dot"/>
          </div>
          <div style={{width:27,height:27,borderRadius:'50%',background:'linear-gradient(135deg,#ff9a4d,#e84c1e)',display:'flex',alignItems:'center',justifyContent:'center'}}>{SVG.user}</div>
          <div style={{cursor:'pointer'}}>{SVG.ham}</div>
        </div>

        {/* Desktop topbar */}
        <div className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:28,height:28,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#555'}}
              onClick={() => setView('list')}>
              {SVG.back}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'.8rem',color:'#555'}}>
              {SVG.grid}
              <span>{topbarBc}</span>
            </div>
          </div>
          <div className="tb-spacer"/>
          <div className="tb-notif">{SVG.notif}<div className="tb-notif-dot"/></div>
          <div className="tb-user">
            <div className="tb-avatar">{SVG.user}</div>
            <span style={{fontSize:'.8rem',fontWeight:500}}>John Doe</span>
            {SVG.chev}
          </div>
        </div>

        {/* Content */}
        {view === 'create' && <AssignmentForm onSubmit={handleSubmit} />}
        {view === 'list' && <AssignmentList onCreateClick={() => setView('create')} />}
        {view === 'settings' && <SchoolSettingsPanel />}

        {/* Mobile bottom nav */}
        <div className="m-bot-nav" style={{display:'none'}}>
          {[
            { id:'home', label:'Home', icon: SVG.grid },
            { id:'list', label:'Assignments', icon: SVG.doc },
          ].map(item => (
            <div key={item.id} className={`m-nav-item ${view===item.id?'active':''}`} onClick={() => setView(item.id as View)}>
              {item.icon}{item.label}
            </div>
          ))}
          <div className="m-nav-fab">
            <button className="m-fab-btn" onClick={() => setView('create')}>{SVG.plus}</button>
          </div>
          {[
            { id:'settings', label:'Settings', icon: SVG.gear },
            { id:'toolkit', label:'AI Toolkit', icon: SVG.ai },
          ].map(item => (
            <div key={item.id} className={`m-nav-item ${view===item.id?'active':''}`} onClick={() => setView(item.id as View)}>
              {item.icon}{item.label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
