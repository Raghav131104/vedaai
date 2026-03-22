'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { Assessment } from '@/types';

export default function AssessmentView({ assessment }: { assessment: Assessment }) {
  const router = useRouter();
  const { regenerateAssessment, fetchSchoolSettings, schoolSettings } = useAssignmentStore();
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => { fetchSchoolSettings(); }, []);

  const schoolLine = [schoolSettings.schoolName, schoolSettings.schoolLocation].filter(Boolean).join(', ');

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const { jobId, assignmentId } = await regenerateAssessment(assessment._id);
      toast.success('Regenerating...');
      router.push(`/processing/${assignmentId}?jobId=${jobId}`);
    } catch (e: any) {
      toast.error(e.message);
      setRegenerating(false);
    }
  };

  return (
    <div>
      {/* Dark AI message bar — exactly like Figma */}
      <div className="out-ai-bar no-print">
        <div className="out-ai-text">
          Certainly, Lakshya! Here are customized Question Paper for your {assessment.grade} {assessment.subject} classes on the NCERT chapters:
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="dl-btn" onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
            Download as PDF
          </button>
          <button className="dl-btn" onClick={handleRegenerate} disabled={regenerating}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={regenerating?{animation:'spin .7s linear infinite'}:{}}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Regenerate
          </button>
        </div>
      </div>

      {/* Paper */}
      <div className="out-paper-scroll">
        <div className="out-paper">
          {/* School header */}
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{fontSize:'1.05rem',fontWeight:700,color:'#111',marginBottom:2}}>{schoolLine}</div>
            {schoolSettings.address && <div style={{fontSize:'.72rem',color:'#666',marginBottom:2}}>{schoolSettings.address}</div>}
            <div style={{fontSize:'.88rem',fontWeight:600,color:'#333',marginBottom:2}}>Subject: {assessment.subject}</div>
            <div style={{fontSize:'.85rem',color:'#555'}}>Class: {assessment.grade}</div>
          </div>

          <div style={{borderTop:'1px solid #ddd',borderBottom:'1px solid #ddd',padding:'6px 0',display:'flex',justifyContent:'space-between',fontSize:'.76rem',color:'#444',marginBottom:10}}>
            <span>Time Allowed: {assessment.duration ? `${assessment.duration} minutes` : 'As per schedule'}</span>
            <span>Maximum Marks: {assessment.totalMarks}</span>
          </div>
          <div style={{fontSize:'.76rem',color:'#444',fontStyle:'italic',marginBottom:14}}>All questions are compulsory unless stated otherwise.</div>

          {/* Student info */}
          <div style={{marginBottom:16}}>
            {[['Name', 120], ['Roll Number', 80], ['Class / Section', 60]].map(([label, w]) => (
              <div key={label as string} style={{display:'flex',alignItems:'center',gap:6,fontSize:'.78rem',color:'#333',marginBottom:5}}>
                {label}:
                <div style={{flex:1,borderBottom:'1px solid #aaa',minWidth:w as number,height:14}}/>
              </div>
            ))}
          </div>

          {/* Sections */}
          {assessment.sections.map((sec, si) => (
            <div key={sec.id}>
              {si > 0 && <div style={{border:'none',borderTop:'1px solid #ddd',margin:'14px 0'}}/>}
              <div style={{fontSize:'.88rem',fontWeight:700,textAlign:'center',color:'#111',margin:'16px 0 8px'}}>{sec.title}</div>
              <div style={{fontSize:'.8rem',fontWeight:700,color:'#111',marginBottom:2}}>{sec.title.replace('Section ','').length === 1 ? '' : ''}{sec.id?.includes('mcq')?'Multiple Choice Questions':sec.id?.includes('short')?'Short Answer Questions':'Questions'}</div>
              <div style={{fontSize:'.75rem',color:'#555',fontStyle:'italic',marginBottom:10}}>{sec.instruction}</div>
              {sec.questions.map((q, qi) => (
                <div key={q.id} style={{fontSize:'.79rem',color:'#222',lineHeight:1.7,marginBottom:6,display:'flex',gap:5}}>
                  <span style={{flexShrink:0}}>{qi+1}.</span>
                  <span>
                    <span className={`diff-${q.difficulty}`}>{q.difficulty}</span>{' '}
                    {q.text} [{q.marks} {q.marks===1?'Mark':'Marks'}]
                  </span>
                </div>
              ))}
            </div>
          ))}

          <div style={{fontSize:'.78rem',fontWeight:700,color:'#111',marginTop:14}}>End of Question Paper</div>

          {/* Answer key */}
          <div style={{borderTop:'1px solid #ddd',margin:'16px 0 0'}}/>
          <div style={{fontSize:'.85rem',fontWeight:700,color:'#111',margin:'12px 0 9px'}}>Answer Key:</div>
          {assessment.sections.flatMap((sec, si) =>
            sec.questions.map((q, qi) => (
              <div key={q.id} style={{fontSize:'.75rem',color:'#333',lineHeight:1.65,marginBottom:7,display:'flex',gap:5}}>
                <span style={{flexShrink:0,fontWeight:500}}>{si*10+qi+1}.</span>
                <span>{q.text.substring(0,70)}... — Refer to textbook chapter notes for complete answer.</span>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media print{.no-print{display:none!important}}`}</style>
    </div>
  );
}
