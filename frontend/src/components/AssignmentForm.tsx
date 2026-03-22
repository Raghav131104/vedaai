'use client';
import { useRef, useState } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { QuestionType } from '@/types';

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq',       label: 'Multiple Choice Questions' },
  { value: 'short',     label: 'Short Questions' },
  { value: 'long',      label: 'Long Answer Questions' },
  { value: 'truefalse', label: 'Diagram/Graph-Based Questions' },
  { value: 'fillblank', label: 'Numerical Problems' },
];

export default function AssignmentForm({ onSubmit }: { onSubmit: () => void }) {
  const { formData, formErrors, isSubmitting, setField, addQuestionConfig, removeQuestionConfig, updateQuestionConfig } = useAssignmentStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const totalQ = formData.questionConfigs.reduce((s, c) => s + c.count, 0);
  const totalM = formData.questionConfigs.reduce((s, c) => s + c.count * c.marks, 0);
  const today = new Date().toISOString().split('T')[0];

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!['application/pdf','text/plain','image/jpeg','image/png'].includes(f.type)) return;
    setField('file', f);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* Header */}
      <div className="cr-header">
        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
          <div className="status-dot"/>
          <span style={{fontSize:'.96rem',fontWeight:700}}>Create Assignment</span>
        </div>
        <div style={{fontSize:'.74rem',color:'#888'}}>Set up a new assignment for your students</div>
        <div className="step-track"><div className="step-fill"/></div>
      </div>

      {/* Scrollable form */}
      <div className="cr-scroll page-scroll">
        <div className="f-card">
          <div className="f-card-title">Assignment Details</div>
          <div className="f-card-sub">Basic information about your assignment</div>

          {/* Upload */}
          <div
            className={`upload-zone${dragOver ? ' drag' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            {formData.file ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:'.8rem',color:'#555'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {formData.file.name}
                <button style={{background:'none',border:'none',cursor:'pointer',color:'#888',display:'flex'}} onClick={e => { e.stopPropagation(); setField('file', null); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ) : (
              <>
                <div style={{color:'#aaa',display:'flex',justifyContent:'center',marginBottom:9}}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                </div>
                <div style={{fontSize:'.8rem',fontWeight:500,color:'#555',marginBottom:4}}>Choose a file or drag &amp; drop it here</div>
                <div style={{fontSize:'.7rem',color:'#888',marginBottom:11}}>JPEG, PNG, upto 10MB</div>
                <span className="browse-btn-ui">Browse Files</span>
              </>
            )}
          </div>
          <div style={{fontSize:'.7rem',color:'#888',textAlign:'center',marginTop:8}}>Upload images of your preferred document/image</div>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.jpg,.jpeg,.png" style={{display:'none'}} onChange={e => handleFile(e.target.files?.[0] || null)}/>

          {/* Due date */}
          <div style={{marginTop:14,marginBottom:13}}>
            <label className="f-label">Due Date</label>
            <div style={{position:'relative'}}>
              <input type="date" className="f-input" min={today} value={formData.dueDate} onChange={e => setField('dueDate', e.target.value)} style={{paddingRight:34}}/>
              <div style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',color:'#888',pointerEvents:'none'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            {formErrors.dueDate && <div className="f-err show">{formErrors.dueDate}</div>}
          </div>

          {/* Title */}
          <div style={{marginBottom:13}}>
            <label className="f-label">Assignment Title *</label>
            <input className={`f-input${formErrors.title?' border-red-400':''}`} placeholder="e.g. Quiz on Electricity" value={formData.title} onChange={e => setField('title', e.target.value)}/>
            {formErrors.title && <div className="f-err show">{formErrors.title}</div>}
          </div>

          {/* Subject + Grade */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:13}}>
            <div>
              <label className="f-label">Subject *</label>
              <input className="f-input" placeholder="e.g. Science" value={formData.subject} onChange={e => setField('subject', e.target.value)}/>
              {formErrors.subject && <div className="f-err show">{formErrors.subject}</div>}
            </div>
            <div>
              <label className="f-label">Grade / Class *</label>
              <input className="f-input" placeholder="e.g. Grade 8" value={formData.grade} onChange={e => setField('grade', e.target.value)}/>
              {formErrors.grade && <div className="f-err show">{formErrors.grade}</div>}
            </div>
          </div>

          {/* Question types */}
          <div style={{marginTop:6}}>
            <div className="qt-header">
              <span>Question Type</span>
              <span style={{textAlign:'center'}}>No. of Questions</span>
              <span style={{textAlign:'center'}}>Marks</span>
            </div>
            {formData.questionConfigs.map((cfg, i) => (
              <div key={i} className="qt-row">
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <select className="qt-sel" value={cfg.type} onChange={e => updateQuestionConfig(i, { type: e.target.value as QuestionType })}>
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div style={{width:20,height:20,borderRadius:'50%',border:'1px solid #ccc',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'white',color:'#888',fontSize:'.85rem',flexShrink:0}}
                    onClick={() => formData.questionConfigs.length > 1 && removeQuestionConfig(i)}>×</div>
                </div>
                <div className="num-ctrl">
                  <button className="num-btn" onClick={() => updateQuestionConfig(i, { count: Math.max(1, cfg.count - 1) })}>−</button>
                  <input className="num-inp" type="number" min={1} value={cfg.count} onChange={e => updateQuestionConfig(i, { count: Math.max(1, parseInt(e.target.value) || 1) })}/>
                  <button className="num-btn" onClick={() => updateQuestionConfig(i, { count: cfg.count + 1 })}>+</button>
                </div>
                <div className="num-ctrl">
                  <button className="num-btn" onClick={() => updateQuestionConfig(i, { marks: Math.max(1, cfg.marks - 1) })}>−</button>
                  <input className="num-inp" type="number" min={1} value={cfg.marks} onChange={e => updateQuestionConfig(i, { marks: Math.max(1, parseInt(e.target.value) || 1) })}/>
                  <button className="num-btn" onClick={() => updateQuestionConfig(i, { marks: cfg.marks + 1 })}>+</button>
                </div>
              </div>
            ))}
            <button className="add-qt" onClick={addQuestionConfig}>
              <span className="add-qt-circle">+</span>
              Add Question Type
            </button>
            <div className="qt-totals">
              <div>Total Questions : <strong>{totalQ}</strong></div>
              <div>Total Marks : <strong>{totalM}</strong></div>
            </div>
          </div>

          {/* Additional info */}
          <div style={{marginTop:14}}>
            <label className="f-label">Additional Information (For better output)</label>
            <div style={{position:'relative'}}>
              <textarea className="f-textarea" placeholder="e.g Generate a question paper for 5 hour exam duration..." value={formData.additionalInstructions} onChange={e => setField('additionalInstructions', e.target.value)}/>
              <button style={{position:'absolute',right:8,bottom:8,width:24,height:24,borderRadius:'50%',background:'none',border:'none',cursor:'pointer',color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cr-footer">
        <button className="btn-prev">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Previous
        </button>
        <button className="btn-next-ui" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? 'Generating...' : <>Next <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
        </button>
      </div>
    </div>
  );
}
