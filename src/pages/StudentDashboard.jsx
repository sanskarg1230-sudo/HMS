import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getAuthItem, setAuthItem, removeAuthItem } from '../utils/api';
import ScrollReveal from '../components/ScrollReveal';
import Footer from '../components/Footer';
import MessMenuTab from '../components/MessMenuTab';
import BugReportModal from '../components/BugReportModal';
import StudentDocumentsTab from '../components/StudentDocumentsTab';
import StudentLeaveTab from '../components/StudentLeaveTab';

const Badge = ({ status }) => {
  const colors = { PAID: 'bg-green-100 text-green-700', UNPAID: 'bg-orange-100 text-orange-600', OPEN: 'bg-red-100 text-red-600', RESOLVED: 'bg-green-100 text-green-700' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-12">
    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">{icon}</span>
    <p className="mt-3 text-on-surface-variant text-sm">{message}</p>
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-sm font-semibold ${type === 'success' ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}>
    <span className="material-symbols-outlined text-base">{type === 'success' ? 'check_circle' : 'error'}</span>
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
  </div>
);

// ── My Room Tab ────────────────────────────────────────────────────────────────
function MyRoomTab() {
  const [data, setData] = useState(null);
  const [notices, setNotices] = useState([]);
  
  useEffect(() => { 
    api.get('/api/student/room').then(setData).catch(() => {}); 
    api.get('/api/student/notices').then(setNotices).catch(() => {});
  }, []);

  if (!data) return <EmptyState icon="bed" message="Loading room info..." />;

  const { room, hostel } = data;

  return (
    <div className="space-y-5 pb-8">
      {/* Room Card */}
      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl">meeting_room</span>
          </div>
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-widest">My Room</div>
            <div className="text-2xl font-extrabold text-on-surface">{room ? `Room ${room.roomNumber}` : 'Not Assigned'}</div>
          </div>
        </div>
        {room ? (
          <div className="grid grid-cols-2 gap-3">
            {[['Type', room.type], ['Capacity', `${room.capacity} person${room.capacity > 1 ? 's' : ''}`]].map(([l, v]) => (
              <div key={l} className="bg-white/60 rounded-xl p-3"><div className="text-xs text-on-surface-variant">{l}</div><div className="font-bold text-on-surface">{v}</div></div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant text-sm">Your room has not been assigned yet. Please contact the hostel admin.</p>
        )}
      </div>

      {/* Recent Notices Preview */}
      {notices.length > 0 && (
        <div className="p-6 bg-secondary/5 rounded-[2rem] border border-secondary/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-on-surface text-base flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-lg">campaign</span>
              </div>
              Recent Announcements
            </h3>
            <button 
              onClick={() => {
                // This logic depends on the parent state, but we can use a custom event or a shared state if needed.
                // For now, we'll assume the parent handles tab switching if we pass a callback, 
                // but since we don't have one here, we'll just show the preview.
              }}
              className="text-xs font-bold text-secondary hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {notices.slice(0, 3).map((n, idx) => (
              <div key={n.id} className={`p-4 rounded-2xl transition-all border ${idx === 0 ? 'bg-white shadow-sm border-secondary/20' : 'bg-white/40 border-outline-variant/10 opacity-80 hover:opacity-100 hover:bg-white/60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                    {n.isPinned && <span className="text-xs">📌</span>}
                    {n.title}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-1 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hostel Info Card */}
      {hostel && (
        <div className="p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 space-y-3">
          <h3 className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-base">apartment</span>Hostel Information</h3>
          {[['hostelName', 'Hostel Name', 'apartment'], ['universityName', 'University', 'school'], ['address', 'Address', 'location_on'], ['wardenEmail', 'Warden Email', 'email'], ['wardenPhone', 'Warden Phone', 'call']].map(([key, label, icon]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-base w-5 shrink-0">{icon}</span>
              <div><div className="text-xs text-on-surface-variant">{label}</div><div className="text-sm font-semibold text-on-surface">{hostel[key] || '—'}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── My Fees Tab ────────────────────────────────────────────────────────────────
function MyFeesTab() {
  const [fees, setFees] = useState([]);
  useEffect(() => { api.get('/api/student/fees').then(setFees).catch(() => {}); }, []);

  const totalDue = fees.filter(f => f.status === 'UNPAID').reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0);

  const formatMoney = (val, cur) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur || 'INR' }).format(val || 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-2xl hover:scale-[1.02] transition-transform duration-300 cursor-default border border-orange-100 hover:shadow-lg hover:shadow-orange-200/50"><div className="text-xs font-bold text-orange-600 mb-1">Amount Due</div><div className="text-2xl font-extrabold text-orange-700">{formatMoney(totalDue, fees[0]?.currency || 'INR')}</div></div>
        <div className="bg-green-50 p-4 rounded-2xl hover:scale-[1.02] transition-transform duration-300 cursor-default border border-green-100 hover:shadow-lg hover:shadow-green-200/50"><div className="text-xs font-bold text-green-600 mb-1">Amount Paid</div><div className="text-2xl font-extrabold text-green-700">{formatMoney(totalPaid, fees[0]?.currency || 'INR')}</div></div>
      </div>
      {fees.length === 0 ? <EmptyState icon="receipt_long" message="No fee records yet." /> : (
        <div className="space-y-3">
          {Array.isArray(fees) && fees.map(f => (
            <div key={f.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
              <div>
                <div className="font-bold text-on-surface">{f.month} {f.year}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Hostel Fee</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-on-surface">{formatMoney(f.amount, f.currency)}</div>
                <Badge status={f.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Complaints Tab ─────────────────────────────────────────────────────────────
function ComplaintsTab({ toast }) {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  const load = () => api.get('/api/student/complaints').then(setComplaints).catch(() => {});

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await api.post('/api/student/complaints', form);
    setSubmitting(false);
    if (res.id) { toast('Complaint submitted!', 'success'); setForm({ title: '', description: '' }); load(); }
    else toast('Failed to submit', 'error');
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-surface-container-low rounded-2xl">
        <h3 className="font-bold text-on-surface mb-4">Submit a Complaint</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Title</label>
            <input className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm outline-none border border-outline-variant/20" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Water heater not working" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Description</label>
            <textarea className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm outline-none border border-outline-variant/20 resize-none" rows="3" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Please describe the issue in detail..." />
          </div>
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-70 flex items-center gap-2">
            {submitting ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : null}
            Submit Complaint
          </button>
        </form>
      </div>
      <div>
        <h3 className="font-bold text-on-surface mb-4">My Complaints</h3>
        {complaints.length === 0 ? <EmptyState icon="report" message="No complaints submitted yet." /> : (
          <div className="space-y-3">
            {Array.isArray(complaints) && complaints.map(c => (
              <div key={c.id} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex items-start gap-3 hover:shadow-md hover:border-secondary/20 hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${c.status === 'OPEN' ? 'bg-red-500' : 'bg-green-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-on-surface">{c.title}</span>
                    <Badge status={c.status} />
                  </div>
                  <p className="text-xs text-on-surface-variant">{c.description}</p>
                  <div className="text-xs text-on-surface-variant mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notices Tab ────────────────────────────────────────────────────────────────
function NoticesTab() {
  const [notices, setNotices] = useState([]);
  useEffect(() => { api.get('/api/student/notices').then(setNotices).catch(() => {}); }, []);

  return (
    <div>
      {notices.length === 0 ? <EmptyState icon="campaign" message="No announcements from the admin yet." /> : (
        <div className="space-y-3">
          {Array.isArray(notices) && notices.map(n => (
            <div key={n.id} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${n.isPinned ? 'bg-primary/5 border-primary/20 hover:bg-primary/[0.08]' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {n.isPinned && <span className="text-sm">📌</span>}
                <span className="font-bold text-on-surface">{n.title}</span>
              </div>
              <p className="text-sm text-on-surface-variant">{n.message}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-xs">person</span>
                <span>{n.adminName}</span>
                <span>·</span>
                <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab (Full) ─────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

function ProfileSection({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
      <button onClick={() => setOpen(p => !p)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-base">{icon}</span>
          </div>
          <span className="font-bold text-on-surface text-sm">{title}</span>
        </div>
        <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-outline-variant/10 pt-4">{children}</div>}
    </div>
  );
}

function EditField({ label, value, onChange, type='text', options }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</label>
      {options ? (
        <select value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/20">
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/20"
          placeholder={label} />
      )}
    </div>
  );
}

function SaveSection({ loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="mt-2 px-5 py-2.5 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-60 transition-all flex items-center gap-2">
      {loading
        ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
        : <span className="material-symbols-outlined text-base">save</span>}
      {loading ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

function ProfileTab({ toast }) {
  const [profile, setProfile] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  // Section forms
  const [personal, setPersonal] = useState({ phone:'', university:'', course:'', year:'', joinDate:'' });
  const [parents,  setParents]  = useState({ fatherName:'', motherName:'', guardianName:'', parentPhone:'', parentEmail:'', emergencyContact:'' });
  const [address,  setAddress]  = useState({ addressLine:'', city:'', state:'', country:'', pincode:'' });
  const [medical,  setMedical]  = useState({ bloodGroup:'', allergies:'', medicalConditions:'', medications:'', doctorContact:'', notes:'' });
  // Section saving
  const [saving, setSaving] = useState({});
  // Leave
  const [leaves, setLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ fromDate:'', toDate:'', reason:'' });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const loadFull = useCallback(() => {
    api.get('/api/student/full-profile').then(p => {
      setFullProfile(p);
      setPersonal({ phone: p.phone||'', university: p.university||'', course: p.course||'', year: p.year||'', joinDate: p.joinDate||'' });
      setParents({ fatherName: p.fatherName||'', motherName: p.motherName||'', guardianName: p.guardianName||'', parentPhone: p.parentPhone||'', parentEmail: p.parentEmail||'', emergencyContact: p.emergencyContact||'' });
      setAddress({ addressLine: p.addressLine||'', city: p.city||'', state: p.state||'', country: p.country||'', pincode: p.pincode||'' });
      setMedical({ bloodGroup: p.bloodGroup||'', allergies: p.allergies||'', medicalConditions: p.medicalConditions||'', medications: p.medications||'', doctorContact: p.doctorContact||'', notes: p.medicalNotes||'' });
    }).catch(() => {});
    api.get('/api/student/leave').then(d => { if (Array.isArray(d)) setLeaves(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/api/student/profile').then(p => { setProfile(p); setName(p.name); }).catch(() => {});
    loadFull();
  }, [loadFull]);

  const saveName = async () => {
    const res = await api.patch('/api/student/profile', { name });
    if (res.id) { setProfile(res); setEditName(false); setAuthItem('hms_name', res.name); toast('Name updated!', 'success'); }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    const res = await api.patch('/api/student/password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
    if (res.message) { toast(res.message, 'success'); setPwForm({ oldPassword:'', newPassword:'', confirm:'' }); }
    else setPwError(res.error || 'Failed to change password');
  };

  const saveSection = async (section, endpoint, data) => {
    setSaving(p => ({...p, [section]: true}));
    const res = await api.patch(endpoint, data).catch(() => ({ error: true }));
    setSaving(p => ({...p, [section]: false}));
    if (res?.error) toast('Save failed', 'error');
    else { toast('Saved!', 'success'); loadFull(); }
  };

  const submitLeave = async () => {
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) { toast('Fill all fields', 'error'); return; }
    setSubmittingLeave(true);
    const res = await api.post('/api/student/leave/request', leaveForm).catch(() => ({ error: true }));
    setSubmittingLeave(false);
    if (res?.id) { toast('Leave request submitted!', 'success'); setLeaveForm({ fromDate:'',toDate:'',reason:'' }); loadFull(); }
    else toast('Submission failed', 'error');
  };

  if (!profile) return <EmptyState icon="person" message="Loading profile..." />;

  const initials = profile.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const cp = fullProfile?.completionPercent || 0;
  // const cs = fullProfile?.completionSections || {};
  const circumference = 138.23;

  const LEAVE_STATUS = { PENDING: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-5 pb-8">
      {/* Avatar + Completion */}
      <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-secondary/8 to-secondary/3 rounded-3xl border border-secondary/10">
        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-md">
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-extrabold text-on-surface text-lg">{profile.name}</div>
          <div className="text-sm text-on-surface-variant">{profile.email}</div>
          {fullProfile?.roomNumber && (
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">meeting_room</span> Room {fullProfile.roomNumber}
            </div>
          )}
        </div>
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" className="text-secondary/10" />
            <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5"
              strokeDasharray={`${(cp / 100) * circumference} ${circumference}`}
              className="text-secondary transition-all duration-700" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-secondary">{cp}%</span>
        </div>
      </div>

      {/* Name edit */}
      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Display Name</label>
        <div className="flex items-center gap-2">
          {editName ? (
            <>
              <input className="flex-1 px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none" value={name} onChange={e => setName(e.target.value)} />
              <button onClick={saveName} className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-xl">Save</button>
              <button onClick={() => { setEditName(false); setName(profile.name); }} className="px-4 py-2 bg-surface-container text-xs font-bold rounded-xl">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditName(true)} className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container-highest transition-all">
              <span className="material-symbols-outlined text-base">edit</span> Edit Name
            </button>
          )}
        </div>
      </div>

      {/* Expandable Sections */}
      <ProfileSection title="Personal Info" icon="person">
        <div className="grid grid-cols-2 gap-3">
          <EditField label="Phone" value={personal.phone} onChange={v => setPersonal(p=>({...p,phone:v}))} />
          <EditField label="University" value={personal.university} onChange={v => setPersonal(p=>({...p,university:v}))} />
          <EditField label="Course" value={personal.course} onChange={v => setPersonal(p=>({...p,course:v}))} />
          <EditField label="Year" value={personal.year} onChange={v => setPersonal(p=>({...p,year:v}))} />
          <EditField label="Join Date" type="date" value={personal.joinDate} onChange={v => setPersonal(p=>({...p,joinDate:v}))} />
        </div>
        <SaveSection loading={saving.personal} onClick={() => saveSection('personal', '/api/student/profile/personal', personal)} />
      </ProfileSection>

      <ProfileSection title="Parent & Guardian Information" icon="family_restroom">
        <div className="grid grid-cols-2 gap-3">
          {[['fatherName','Father Name'],['motherName','Mother Name'],['guardianName','Guardian Name'],['parentPhone','Parent Phone'],['parentEmail','Parent Email'],['emergencyContact','Emergency Contact']].map(([k,l]) => (
            <EditField key={k} label={l} value={parents[k]} onChange={v => setParents(p=>({...p,[k]:v}))} />
          ))}
        </div>
        <SaveSection loading={saving.parents} onClick={() => saveSection('parents', '/api/student/profile/parents', parents)} />
      </ProfileSection>

      <ProfileSection title="Home Address" icon="home">
        <EditField label="Address Line" value={address.addressLine} onChange={v => setAddress(p=>({...p,addressLine:v}))} />
        <div className="grid grid-cols-2 gap-3">
          {[['city','City'],['state','State'],['country','Country'],['pincode','Pincode']].map(([k,l]) => (
            <EditField key={k} label={l} value={address[k]} onChange={v => setAddress(p=>({...p,[k]:v}))} />
          ))}
        </div>
        <SaveSection loading={saving.address} onClick={() => saveSection('address', '/api/student/profile/address', address)} />
      </ProfileSection>

      <ProfileSection title="Medical Information" icon="health_and_safety">
        <div className="grid grid-cols-2 gap-3">
          <EditField label="Blood Group" value={medical.bloodGroup} onChange={v => setMedical(p=>({...p,bloodGroup:v}))} options={BLOOD_GROUPS} />
          <EditField label="Doctor Contact" value={medical.doctorContact} onChange={v => setMedical(p=>({...p,doctorContact:v}))} />
        </div>
        {[['allergies','Allergies'],['medicalConditions','Medical Conditions'],['medications','Current Medications'],['notes','Additional Notes']].map(([k,l]) => (
          <div key={k}>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{l}</label>
            <textarea value={medical[k]||''} onChange={e => setMedical(p=>({...p,[k]:e.target.value}))}
              className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none resize-none"
              rows={2} placeholder={l} />
          </div>
        ))}
        <SaveSection loading={saving.medical} onClick={() => saveSection('medical', '/api/student/profile/medical', medical)} />
      </ProfileSection>

      {/* Leave Requests */}
      <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
        <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-base">event_available</span> Leave Requests
        </h3>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">From Date</label>
              <input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm(p=>({...p,fromDate:e.target.value}))}
                className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">To Date</label>
              <input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm(p=>({...p,toDate:e.target.value}))}
                className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Reason</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm(p=>({...p,reason:e.target.value}))}
              className="w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none resize-none" rows={2} />
          </div>
          <button onClick={submitLeave} disabled={submittingLeave}
            className="px-5 py-2.5 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-60 transition-all flex items-center gap-2">
            {submittingLeave ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">send</span>}
            Submit Request
          </button>
        </div>
        {leaves.length > 0 && (
          <div className="space-y-2 border-t border-outline-variant/10 pt-4">
            <div className="text-xs font-bold text-on-surface-variant mb-2">HISTORY</div>
            {leaves.map(l => (
              <div key={l.id} className="flex items-start justify-between gap-3 p-3 bg-surface-container-high rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${LEAVE_STATUS[l.status]}`}>{l.status}</span>
                    <span className="text-xs text-on-surface-variant">{l.fromDate} → {l.toDate}</span>
                  </div>
                  <p className="text-xs text-on-surface mt-1">{l.reason}</p>
                  {l.adminNote && <p className="text-xs text-on-surface-variant italic mt-0.5">Admin: {l.adminNote}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
        <h3 className="font-bold text-on-surface mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-3">
          {pwError && <p className="text-red-500 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{pwError}</p>}
          {[['oldPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm New Password']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}</label>
              <input type="password" className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none border border-outline-variant/20" value={pwForm[key]} onChange={e => setPwForm(p => ({...p, [key]: e.target.value}))} required />
            </div>
          ))}
          <button type="submit" className="px-6 py-3 bg-secondary text-white font-bold rounded-xl mt-2">Change Password</button>
        </form>
      </div>
    </div>
  );
}


// ── Main Student Dashboard ─────────────────────────────────────────────────────

const TABS = [
  { id: 'room', label: 'My Room', icon: 'bed' },
  { id: 'fees', label: 'My Fees', icon: 'payments' },
  { id: 'mess', label: 'Mess Menu', icon: 'restaurant_menu' },
  { id: 'complaints', label: 'Complaints', icon: 'report' },
  { id: 'notices', label: 'Notices', icon: 'campaign' },
  { id: 'leave', label: 'My Leave', icon: 'flight_takeoff' },
  { id: 'documents', label: 'Documents', icon: 'folder_open' },
  { id: 'profile', label: 'My Profile', icon: 'person' },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('room');
  const [toastMsg, setToastMsg] = useState(null);

  const studentEmail = getAuthItem('hms_email');
  const studentId = getAuthItem('hms_user_id');

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const logout = () => {
    ['hms_token', 'hms_role', 'hms_email', 'hms_name', 'hms_user_id'].forEach(k => removeAuthItem(k));
    navigate('/');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'room': return <MyRoomTab />;
      case 'fees': return <MyFeesTab />;
      case 'mess': return <MessMenuTab api={api} />;
      case 'complaints': return <ComplaintsTab toast={showToast} />;
      case 'notices': return <NoticesTab />;
      case 'leave': return <StudentLeaveTab toast={showToast} />;
      case 'documents': return <StudentDocumentsTab toast={showToast} />;
      case 'profile': return <ProfileTab toast={showToast} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">school</span>
          </div>
          <div>
            <div className="font-extrabold text-on-surface text-sm">Student Dashboard</div>
            <div className="text-xs text-on-surface-variant">{studentEmail}</div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all">
          <span className="material-symbols-outlined text-base">logout</span>
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-white/60 backdrop-blur-sm border-r border-outline-variant/10 p-4 hidden md:block shrink-0 sticky top-[73px] h-[calc(100vh-73px)]">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${activeTab === tab.id ? 'bg-secondary text-white shadow-sm scale-[1.02]' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:pl-6'}`}
              >
                <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto flex flex-col justify-between">
          <div className="p-6 pb-24 md:pb-10 w-full mb-8">
            <ScrollReveal key={activeTab}>
              <div className="max-w-3xl mx-auto w-full">
                <h2 className="text-2xl font-extrabold text-on-surface mb-6">{TABS.find(t => t.id === activeTab)?.label}</h2>
                {renderTab()}
              </div>
            </ScrollReveal>
          </div>
        </main>

        {/* Mobile Tab Bar — horizontally scrollable, all tabs */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/10 md:hidden z-40 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map(tab => {
              const shortLabel = {
                'My Room': 'Room', 'My Fees': 'Fees', 'Mess Menu': 'Mess',
                'My Leave': 'Leave', 'My Profile': 'Profile', 'Activity Logs': 'Logs',
              }[tab.label] || tab.label;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-4 py-3 text-[9px] font-bold whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'text-secondary' : 'text-on-surface-variant'}`}
                >
                  <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
      <BugReportModal
        userId={studentId ? Number(studentId) : undefined}
        userEmail={studentEmail}
        role="student"
        pageUrl="/student/dashboard"
      />
    </div>
  );
}

export default StudentDashboard;
