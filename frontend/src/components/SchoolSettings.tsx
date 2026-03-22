'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { SchoolSettings } from '@/types';

export default function SchoolSettingsPanel() {
  const { schoolSettings, fetchSchoolSettings, saveSchoolSettings } = useAssignmentStore();
  const [form, setForm] = useState<SchoolSettings>({ ...schoolSettings });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSchoolSettings(); }, []);
  useEffect(() => { setForm({ ...schoolSettings }); }, [schoolSettings]);

  const upd = (k: keyof SchoolSettings, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.schoolName?.trim()) { toast.error('School name is required'); return; }
    if (!form.schoolLocation?.trim()) { toast.error('Location is required'); return; }
    setSaving(true);
    try {
      await saveSchoolSettings(form);
      toast.success('Settings saved!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const previewLine = [form.schoolName, form.schoolLocation].filter(Boolean).join(', ');

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div className="cr-header">
        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
          <div className="status-dot"/>
          <span style={{fontSize:'.96rem',fontWeight:700}}>School Settings</span>
        </div>
        <div style={{fontSize:'.74rem',color:'#888'}}>These details appear on every generated question paper header</div>
      </div>

      <div className="settings-scroll">
        <div className="settings-card">
          <div className="f-card-title">School Details</div>
          <div className="f-card-sub">Shown on the question paper header</div>

          <div style={{marginBottom:13}}>
            <label className="f-label">School Name *</label>
            <input className="f-input" placeholder="e.g. Delhi Public School" value={form.schoolName} onChange={e => upd('schoolName', e.target.value)}/>
          </div>
          <div style={{marginBottom:13}}>
            <label className="f-label">Location / City *</label>
            <input className="f-input" placeholder="e.g. Sector-4, Bokaro Steel City" value={form.schoolLocation} onChange={e => upd('schoolLocation', e.target.value)}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:13}}>
            <div>
              <label className="f-label">Board Affiliation</label>
              <select className="f-input" style={{appearance:'none',cursor:'pointer'}} value={form.boardAffiliation||'CBSE'} onChange={e => upd('boardAffiliation', e.target.value)}>
                {['CBSE','ICSE','State Board','IB','IGCSE','Other'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="f-label">Principal Name</label>
              <input className="f-input" placeholder="Dr. A.K. Sharma" value={form.principalName||''} onChange={e => upd('principalName', e.target.value)}/>
            </div>
          </div>
          <div style={{marginBottom:13}}>
            <label className="f-label">Full Address</label>
            <input className="f-input" placeholder="Sector-4, Bokaro Steel City, Jharkhand – 827004" value={form.address||''} onChange={e => upd('address', e.target.value)}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:13}}>
            <div>
              <label className="f-label">Email</label>
              <input type="email" className="f-input" placeholder="office@school.edu.in" value={form.contactEmail||''} onChange={e => upd('contactEmail', e.target.value)}/>
            </div>
            <div>
              <label className="f-label">Phone</label>
              <input className="f-input" placeholder="+91 12345 67890" value={form.contactPhone||''} onChange={e => upd('contactPhone', e.target.value)}/>
            </div>
          </div>

          {/* Live preview */}
          <div className="preview-box">
            <div style={{fontSize:'.68rem',color:'#888',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Paper Header Preview</div>
            <div style={{fontSize:'.92rem',fontWeight:700,color:'#111'}}>{previewLine || 'School Name, Location'}</div>
            {form.address && <div style={{fontSize:'.72rem',color:'#666',marginTop:3}}>{form.address}</div>}
            <div style={{fontSize:'.72rem',color:'#555',marginTop:4}}>Subject: [Subject] &nbsp;|&nbsp; Class: [Grade]</div>
          </div>

          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
