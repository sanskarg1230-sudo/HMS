import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

// ── Constants ──────────────────────────────────────────────────────────────────

const DOC_TYPES = {
  ID_PROOF: { label: 'ID Proof', icon: 'badge' },
  ADMISSION_LETTER: { label: 'Admission Letter', icon: 'description' },
  MEDICAL_CERTIFICATE: { label: 'Medical Certificate', icon: 'health_and_safety' },
  POLICE_VERIFICATION: { label: 'Police Verification', icon: 'local_police' },
  PASSPORT_PHOTO: { label: 'Passport Photo', icon: 'photo_camera' },
  OTHER: { label: 'Other', icon: 'attach_file' },
};

const LEAVE_STATUS_COLORS = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

const DOC_STATUS_COLORS = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
    <span className="text-sm text-on-surface font-medium">{value || <span className="text-on-surface-variant/50 italic">Not set</span>}</span>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
    <div className="flex items-center gap-2 mb-4">
      <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      <h3 className="font-extrabold text-on-surface text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

const SaveBtn = ({ loading, onClick, label = 'Save Changes' }) => (
  <button onClick={onClick} disabled={loading}
    className="mt-4 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center gap-2">
    {loading ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">save</span>}
    {loading ? 'Saving…' : label}
  </button>
);

// ── Completion Ring ────────────────────────────────────────────────────────────

function CompletionRing({ percent, sections }) {
  const circumference = 138.23;
  return (
    <div className="flex items-center gap-6 p-5 bg-gradient-to-br from-primary/8 to-primary/3 rounded-2xl border border-primary/10 mb-6">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="7" className="text-primary/10" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="7"
            strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
            className="text-primary transition-all duration-700" strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-primary">{percent}%</span>
      </div>
      <div className="flex-1">
        <div className="font-extrabold text-on-surface mb-2">Profile Completion</div>
        <div className="space-y-1">
          {sections && Object.entries(sections).map(([key, done]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className={`material-symbols-outlined text-sm ${done ? 'text-green-500' : 'text-on-surface-variant/40'}`}>
                {done ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={done ? 'text-on-surface' : 'text-on-surface-variant'}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────────────────────

function OverviewTab({ profile }) {
  if (!profile) return null;
  const initials = profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-outline-variant/10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-md">
          {initials}
        </div>
        <div>
          <div className="font-extrabold text-on-surface text-lg">{profile.name}</div>
          <div className="text-sm text-on-surface-variant">{profile.email}</div>
          <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">apartment</span>{profile.hostelName || `Hostel #${profile.hostelId}` || '—'}
            <span className="material-symbols-outlined text-sm ml-2">meeting_room</span>{profile.roomNumber ? `Room ${profile.roomNumber}` : 'No Room'}
          </div>
        </div>
      </div>

      <CompletionRing percent={profile.completionPercent || 0} sections={profile.completionSections} />

      <SectionCard title="Basic Information" icon="person">
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow label="University" value={profile.university} />
          <InfoRow label="Course" value={profile.course} />
          <InfoRow label="Year" value={profile.year} />
          <InfoRow label="Join Date" value={profile.joinDate} />
          <InfoRow label="Joined System" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null} />
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab: Parents ───────────────────────────────────────────────────────────────

function ParentsTab({ profile, studentId, toast }) {
  const [form, setForm] = useState({
    fatherName: profile?.fatherName || '',
    motherName: profile?.motherName || '',
    guardianName: profile?.guardianName || '',
    parentPhone: profile?.parentPhone || '',
    parentEmail: profile?.parentEmail || '',
    emergencyContact: profile?.emergencyContact || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await api.patch(`/admin/students/${studentId}/profile/parents`, form).catch(() => ({ error: true }));
    setSaving(false);
    toast(res?.error ? 'Save failed' : 'Parents info saved!', res?.error ? 'error' : 'success');
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Parent / Guardian Information" icon="family_restroom">
        <div className="grid grid-cols-2 gap-4">
          {[['fatherName','Father Name'],['motherName','Mother Name'],['guardianName','Guardian Name'],
            ['parentPhone','Parent Phone'],['parentEmail','Parent Email'],['emergencyContact','Emergency Contact']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{l}</label>
              <input value={form[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
                className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder={l} />
            </div>
          ))}
        </div>
        <SaveBtn loading={saving} onClick={save} />
      </SectionCard>
    </div>
  );
}

// ── Tab: Address ───────────────────────────────────────────────────────────────

function AddressTab({ profile, studentId, toast }) {
  const [form, setForm] = useState({
    addressLine: profile?.addressLine || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
    pincode: profile?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await api.patch(`/admin/students/${studentId}/profile/address`, form).catch(() => ({ error: true }));
    setSaving(false);
    toast(res?.error ? 'Save failed' : 'Address saved!', res?.error ? 'error' : 'success');
  };

  return (
    <SectionCard title="Home Address" icon="home">
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Address Line</label>
          <input value={form.addressLine} onChange={e => setForm(p => ({...p, addressLine: e.target.value}))}
            className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Street address" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['city','City'],['state','State'],['country','Country'],['pincode','Pincode']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{l}</label>
              <input value={form[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
                className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={l} />
            </div>
          ))}
        </div>
      </div>
      <SaveBtn loading={saving} onClick={save} />
    </SectionCard>
  );
}

// ── Tab: Medical ───────────────────────────────────────────────────────────────

function MedicalTab({ profile, studentId, toast }) {
  const [form, setForm] = useState({
    bloodGroup: profile?.bloodGroup || '',
    allergies: profile?.allergies || '',
    medicalConditions: profile?.medicalConditions || '',
    medications: profile?.medications || '',
    doctorContact: profile?.doctorContact || '',
    notes: profile?.medicalNotes || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await api.patch(`/admin/students/${studentId}/medical`, form).catch(() => ({ error: true }));
    setSaving(false);
    toast(res?.error ? 'Save failed' : 'Medical record saved!', res?.error ? 'error' : 'success');
  };

  const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

  return (
    <SectionCard title="Medical Records" icon="health_and_safety">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Blood Group</label>
          <select value={form.bloodGroup} onChange={e => setForm(p => ({...p, bloodGroup: e.target.value}))}
            className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Select…</option>
            {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Doctor Contact</label>
          <input value={form.doctorContact} onChange={e => setForm(p => ({...p, doctorContact: e.target.value}))}
            className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Doctor name / phone" />
        </div>
      </div>
      {[['allergies','Allergies'],['medicalConditions','Medical Conditions'],['medications','Current Medications'],['notes','Additional Notes']].map(([k,l]) => (
        <div key={k} className="mt-3">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{l}</label>
          <textarea value={form[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
            className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            rows={2} placeholder={l} />
        </div>
      ))}
      <SaveBtn loading={saving} onClick={save} />
    </SectionCard>
  );
}

// ── Tab: Leave ─────────────────────────────────────────────────────────────────

function LeaveTab({ studentId, toast }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/students/${studentId}/leave`)
      .then(d => { if (Array.isArray(d)) setLeaves(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const addLeave = async () => {
    if (!form.fromDate || !form.toDate || !form.reason) { toast('Fill all fields', 'error'); return; }
    setSaving(true);
    const res = await api.post(`/admin/students/${studentId}/leave`, form).catch(() => ({ error: true }));
    setSaving(false);
    if (res?.id) { toast('Leave record added!', 'success'); setShowForm(false); setForm({ fromDate:'',toDate:'',reason:'' }); load(); }
    else toast('Failed to add leave', 'error');
  };

  const actionLeave = async (leaveId, action) => {
    const res = await api.put(`/admin/leave/${leaveId}/${action}`, {}).catch(() => ({ error: true }));
    if (res?.id) { toast(`Leave ${action}d!`, 'success'); load(); }
    else toast('Action failed', 'error');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-on-surface">Leave Records</h3>
        <button onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-base">add</span> Add Leave
        </button>
      </div>

      {showForm && (
        <div className="p-5 bg-white rounded-2xl border border-outline-variant/10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">From Date</label>
              <input type="date" value={form.fromDate} onChange={e => setForm(p=>({...p,fromDate:e.target.value}))}
                className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">To Date</label>
              <input type="date" value={form.toDate} onChange={e => setForm(p=>({...p,toDate:e.target.value}))}
                className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Reason</label>
            <textarea value={form.reason} onChange={e => setForm(p=>({...p,reason:e.target.value}))}
              className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2} placeholder="Reason for leave" />
          </div>
          <SaveBtn loading={saving} onClick={addLeave} label="Add Leave Record" />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10"><span className="material-symbols-outlined text-3xl animate-spin text-on-surface-variant">progress_activity</span></div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">event_busy</span>
          <p className="mt-2 text-sm text-on-surface-variant">No leave records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className="bg-white rounded-2xl border border-outline-variant/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${LEAVE_STATUS_COLORS[l.status]}`}>{l.status}</span>
                    <span className="text-xs text-on-surface-variant">{l.fromDate} → {l.toDate}</span>
                  </div>
                  <p className="text-sm text-on-surface">{l.reason}</p>
                  {l.adminNote && <p className="text-xs text-on-surface-variant mt-1 italic">Note: {l.adminNote}</p>}
                  {l.actionedBy && <p className="text-xs text-on-surface-variant">Actioned by: {l.actionedBy}</p>}
                </div>
                {l.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => actionLeave(l.id, 'approve')}
                      className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                      ✓ Approve
                    </button>
                    <button onClick={() => actionLeave(l.id, 'reject')}
                      className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Documents ─────────────────────────────────────────────────────────────

function DocumentsTab({ studentId, toast }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/students/${studentId}/documents`)
      .then(d => { if (Array.isArray(d)) setDocuments(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const verify = async (docId) => {
    const res = await api.put(`/admin/documents/${docId}/verify`, {}).catch(() => ({ error: true }));
    if (res?.id) { toast('Document verified!', 'success'); load(); }
    else toast('Verify failed', 'error');
  };

  const reject = async () => {
    if (!rejectModal) return;
    const res = await api.put(`/admin/documents/${rejectModal}/reject`, { adminNote: rejectNote }).catch(() => ({ error: true }));
    if (res?.id) { toast('Document rejected', 'success'); setRejectModal(null); setRejectNote(''); load(); }
    else toast('Reject failed', 'error');
  };

  const download = async (doc) => {
    try {
      const blob = await api.download(`/admin/documents/${doc.id}/download`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = doc.originalFilename || 'document';
      a.click(); URL.revokeObjectURL(url);
    } catch { toast('Download failed', 'error'); }
  };

  return (
    <div className="space-y-4">
      {/* Reject Note Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-on-surface mb-3">Reject Document</h3>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none resize-none mb-4"
              rows={3} placeholder="Reason for rejection (shown to student)" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                className="flex-1 py-2.5 bg-surface-container text-on-surface font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={reject}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600">Reject</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10"><span className="material-symbols-outlined text-3xl animate-spin text-on-surface-variant">progress_activity</span></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">folder_open</span>
          <p className="mt-2 text-sm text-on-surface-variant">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const typeInfo = DOC_TYPES[doc.documentType] || { label: doc.documentType, icon: 'attach_file' };
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-outline-variant/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{typeInfo.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-on-surface">{typeInfo.label}</div>
                    <div className="text-xs text-on-surface-variant truncate">{doc.originalFilename}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${DOC_STATUS_COLORS[doc.status]}`}>{doc.status}</span>
                      {doc.uploadedAt && <span className="text-xs text-on-surface-variant">{new Date(doc.uploadedAt).toLocaleDateString()}</span>}
                      {doc.verifiedBy && <span className="text-xs text-on-surface-variant">by {doc.verifiedBy}</span>}
                      {doc.adminNote && <span className="text-xs text-red-500 italic">"{doc.adminNote}"</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => download(doc)} title="Download"
                      className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">download</span>
                    </button>
                    {doc.status !== 'VERIFIED' && (
                      <button onClick={() => verify(doc.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">
                        ✓ Verify
                      </button>
                    )}
                    {doc.status !== 'REJECTED' && (
                      <button onClick={() => { setRejectModal(doc.id); setRejectNote(''); }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
                        ✕ Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

const PROFILE_TABS = [
  { id: 'overview',  label: 'Overview',  icon: 'person' },
  { id: 'parents',   label: 'Parents',   icon: 'family_restroom' },
  { id: 'address',   label: 'Address',   icon: 'home' },
  { id: 'medical',   label: 'Medical',   icon: 'health_and_safety' },
  { id: 'leave',     label: 'Leave',     icon: 'event_busy' },
  { id: 'documents', label: 'Documents', icon: 'folder_open' },
];

export default function StudentProfileModal({ student, onClose, toast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    api.get(`/admin/students/${student.id}/profile`)
      .then(d => { setProfile(d); })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, [student]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl bg-surface-container-low flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ animation: 'slideInRight 0.25s ease-out' }}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/10 bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-extrabold text-sm">
              {student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold text-on-surface">{student.name}</div>
              <div className="text-xs text-on-surface-variant">{student.email}</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 p-3 bg-white/60 border-b border-outline-variant/10 overflow-x-auto shrink-0">
          {PROFILE_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="material-symbols-outlined text-4xl animate-spin text-on-surface-variant">progress_activity</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview'  && <OverviewTab profile={profile} />}
              {activeTab === 'parents'   && <ParentsTab profile={profile} studentId={student.id} toast={toast} />}
              {activeTab === 'address'   && <AddressTab profile={profile} studentId={student.id} toast={toast} />}
              {activeTab === 'medical'   && <MedicalTab profile={profile} studentId={student.id} toast={toast} />}
              {activeTab === 'leave'     && <LeaveTab studentId={student.id} toast={toast} />}
              {activeTab === 'documents' && <DocumentsTab studentId={student.id} toast={toast} />}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
