'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import AssessmentView from '@/components/AssessmentView';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { currentAssessment, fetchAssessment } = useAssignmentStore();

  useEffect(() => { fetchAssessment(params.id as string); }, [params.id]);

  return (
    <div style={{minHeight:'100vh',background:'#e5e5e5',fontFamily:'Inter,sans-serif'}}>
      {/* Topbar */}
      <div style={{height:56,display:'flex',alignItems:'center',padding:'0 18px',borderBottom:'1px solid #e0e0e0',background:'white',gap:8,position:'sticky',top:0,zIndex:10}}>
        <div style={{width:28,height:28,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#555'}} onClick={() => router.push('/')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </div>
        <span style={{fontSize:'.8rem',color:'#555',cursor:'pointer'}} onClick={() => router.push('/')}>← Create New</span>
        <div style={{flex:1}}/>
        <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#ff9a4d,#e84c1e)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span style={{fontSize:'.8rem',fontWeight:500}}>John Doe</span>
      </div>
      {currentAssessment ? (
        <AssessmentView assessment={currentAssessment}/>
      ) : (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}>
          <div style={{textAlign:'center'}}>
            <div style={{width:40,height:40,border:'2px solid #e84c1e',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .85s linear infinite',margin:'0 auto 16px'}}/>
            <p style={{color:'#888',fontSize:'.85rem'}}>Loading assessment...</p>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
