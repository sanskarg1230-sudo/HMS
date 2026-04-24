import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import Footer from '../components/Footer';

const BASE = '/api';

const Badge = ({ status }) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-gray-100 text-gray-600',
    resolved: 'bg-green-100 text-green-700',
    in_progress: 'bg-orange-100 text-orange-600',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-sm font-semibold ${type === 'success' ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}>
    <span className="material-symbols-outlined text-base">{type === 'success' ? 'check_circle' : 'error'}</span>
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
  </div>
);

// ── Contact Messages Tab ───────────────────────────────────────────────────────
function ContactMessagesTab({ token, showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/contact/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status, shouldClose = false) => {
    try {
      const res = await fetch(`${BASE}/contact/${id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { 
        showToast(`Marked as ${status}`, 'success'); 
        load(); 
        if (shouldClose) {
          setSelectedMsg(null);
        } else {
          setSelectedMsg(prev => (prev && prev.id === id ? { ...prev, status } : prev));
        }
      }
      else showToast('Failed to update status', 'error');
    } catch { showToast('Server error', 'error'); }
  };

  const counts = {
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'New', val: counts.new, icon: 'mark_email_unread', color: 'text-blue-600' },
          { label: 'Read', val: counts.read, icon: 'drafts', color: 'text-gray-500' },
          { label: 'Resolved', val: counts.resolved, icon: 'check_circle', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedMsg(null); }}>
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">{selectedMsg.subject}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{selectedMsg.name} · {selectedMsg.email}</p>
              </div>
              <button onClick={() => setSelectedMsg(null)} className="text-on-surface-variant hover:text-on-surface material-symbols-outlined">close</button>
            </div>
            <div className="p-5 bg-surface-container-low rounded-2xl text-sm text-on-surface leading-relaxed mb-6">
              {selectedMsg.message}
            </div>
            <div className="flex items-center gap-2 mb-6 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {selectedMsg.createdAt ? new Date(selectedMsg.createdAt).toLocaleString() : '—'}
              <span className="ml-2"><Badge status={selectedMsg.status} /></span>
            </div>
            <div className="flex gap-3">
              {selectedMsg.status !== 'read' && selectedMsg.status !== 'resolved' && (
                <button onClick={() => updateStatus(selectedMsg.id, 'read')} className="flex-1 py-2.5 bg-surface-container text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container-high transition-colors">
                  Mark as Read
                </button>
              )}
              {selectedMsg.status !== 'resolved' && (
                <button onClick={() => updateStatus(selectedMsg.id, 'resolved', true)} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors">
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-on-surface">Contact Messages</h2>
          <button onClick={load} className="text-xs font-bold px-4 py-2 bg-surface-container-high rounded-xl flex items-center gap-1 hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined text-base">refresh</span> Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center py-16"><span className="material-symbols-outlined text-4xl animate-spin text-on-surface-variant">progress_activity</span></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">inbox</span>
            <p className="mt-3 text-on-surface-variant text-sm">No contact messages yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                <tr>
                  {['Name', 'Email', 'Subject', 'Preview', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {messages.map(m => (
                  <tr key={m.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-on-surface whitespace-nowrap">{m.name}</td>
                    <td className="px-5 py-4 text-on-surface-variant text-xs">{m.email}</td>
                    <td className="px-5 py-4 text-on-surface whitespace-nowrap">{m.subject}</td>
                    <td className="px-5 py-4 text-on-surface-variant max-w-xs">
                      <span className="line-clamp-1">{m.message}</span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap text-xs">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4"><Badge status={m.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedMsg(m); if (m.status === 'new') updateStatus(m.id, 'read'); }}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        {m.status !== 'resolved' && (
                          <button
                            onClick={() => updateStatus(m.id, 'resolved', true)}
                            className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bug Reports Tab ────────────────────────────────────────────────────────────
function BugReportsTab({ token, showToast }) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/bugs`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setBugs(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status, shouldClose = false) => {
    try {
      const res = await fetch(`${BASE}/bugs/${id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { 
        showToast(`Status updated to ${status}`, 'success'); 
        load(); 
        if (shouldClose) {
          setSelectedBug(null);
        } else {
          setSelectedBug(prev => (prev && prev.id === id ? { ...prev, status } : prev));
        }
      }
      else showToast('Failed to update status', 'error');
    } catch { showToast('Server error', 'error'); }
  };

  const shown = statusFilter === 'ALL' ? bugs : bugs.filter(b => b.status === statusFilter);

  const counts = {
    new: bugs.filter(b => b.status === 'new').length,
    in_progress: bugs.filter(b => b.status === 'in_progress').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'New', val: counts.new, icon: 'bug_report', color: 'text-red-500' },
          { label: 'In Progress', val: counts.in_progress, icon: 'engineering', color: 'text-orange-500' },
          { label: 'Resolved', val: counts.resolved, icon: 'check_circle', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Bug Detail Modal */}
      {selectedBug && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedBug(null); }}>
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">{selectedBug.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-on-surface-variant">{selectedBug.userEmail || `User #${selectedBug.userId}`}</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full capitalize">{selectedBug.role}</span>
                </div>
              </div>
              <button onClick={() => setSelectedBug(null)} className="text-on-surface-variant hover:text-on-surface material-symbols-outlined">close</button>
            </div>

            <div className="p-5 bg-surface-container-low rounded-2xl text-sm text-on-surface leading-relaxed mb-4">
              {selectedBug.description}
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">link</span>{selectedBug.pageUrl || '—'}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{selectedBug.createdAt ? new Date(selectedBug.createdAt).toLocaleString() : '—'}</span>
            </div>

            {/* Screenshot preview */}
            {selectedBug.id && (
              <div className="mb-6">
                <img
                  src={`${BASE}/bugs/${selectedBug.id}/screenshot`}
                  alt="Bug screenshot"
                  className="w-full rounded-xl border border-outline-variant/10 object-contain max-h-60"
                  onError={e => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="flex gap-3">
              {selectedBug.status !== 'in_progress' && selectedBug.status !== 'resolved' && (
                <button onClick={() => updateStatus(selectedBug.id, 'in_progress')} className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors">
                  Mark In Progress
                </button>
              )}
              {selectedBug.status !== 'resolved' && (
                <button onClick={() => updateStatus(selectedBug.id, 'resolved', true)} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors">
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter + Table */}
      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-extrabold text-on-surface">Bug Reports</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-surface-container-high rounded-xl">
              {['ALL', 'new', 'in_progress', 'resolved'].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button onClick={load} className="text-xs font-bold px-4 py-2 bg-surface-container-high rounded-xl flex items-center gap-1 hover:bg-surface-container-highest transition-all">
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16"><span className="material-symbols-outlined text-4xl animate-spin text-on-surface-variant">progress_activity</span></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">bug_report</span>
            <p className="mt-3 text-on-surface-variant text-sm">No bug reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                <tr>
                  {['User', 'Role', 'Subject', 'Description', 'Page', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {shown.map(b => (
                  <tr key={b.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-on-surface text-xs">{b.userName || `#${b.userId}`}</div>
                      <div className="text-xs text-on-surface-variant">{b.userEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full capitalize">{b.role}</span>
                    </td>
                    <td className="px-5 py-4 text-on-surface whitespace-nowrap">{b.subject}</td>
                    <td className="px-5 py-4 text-on-surface-variant max-w-xs">
                      <span className="line-clamp-1">{b.description}</span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant text-xs font-mono">{b.pageUrl || '—'}</td>
                    <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap text-xs">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4"><Badge status={b.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedBug(b)} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                          View
                        </button>
                        {b.status === 'new' && (
                          <button onClick={() => updateStatus(b.id, 'in_progress')} className="px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap">
                            Start
                          </button>
                        )}
                        {b.status !== 'resolved' && (
                          <button onClick={() => updateStatus(b.id, 'resolved', true)} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Super Admin Dashboard ──────────────────────────────────────────────────

const SA_TABS = [
  { id: 'requests', label: 'Admin Requests', icon: 'admin_panel_settings' },
  { id: 'contact',  label: 'Contact Messages', icon: 'mail' },
  { id: 'bugs',     label: 'Bug Reports', icon: 'bug_report' },
];

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [logging, setLogging] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToastMsg] = useState(null);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    const t = sessionStorage.getItem('superadmin_token');
    if (t) { setToken(t); setLoggedIn(true); }
  }, []);

  useEffect(() => { if (loggedIn && token) loadRequests(); }, [loggedIn, token]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/admin-requests`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch { }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLogging(true);
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok || data.role !== 'super_admin') {
        setLoginError('Invalid credentials or insufficient role.');
        setLogging(false);
        return;
      }
      sessionStorage.setItem('superadmin_token', data.token);
      setToken(data.token);
      setLoggedIn(true);
    } catch {
      setLoginError('Could not connect to server. Is the backend running?');
    }
    setLogging(false);
  };

  const authPost = async (url) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  };

  const showToast = (msg, type) => { setToastMsg({ msg, type }); setTimeout(() => setToastMsg(null), 3500); };

  const approve = async (id) => {
    const res = await authPost(`${BASE}/admin-requests/${id}/approve`);
    if (res.id) { showToast('Request approved! Admin account created.', 'success'); loadRequests(); }
    else showToast(res.message || 'Error approving request', 'error');
  };

  const reject = async (id) => {
    const res = await authPost(`${BASE}/admin-requests/${id}/reject`);
    if (res.id) { showToast('Request rejected.', 'success'); loadRequests(); }
  };

  const logout = () => { sessionStorage.removeItem('superadmin_token'); setLoggedIn(false); setToken(''); navigate('/'); };

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;

  // ── Login Gate ──────────────────────────────────────────────────────────────
  if (!loggedIn) return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container flex items-center justify-center p-6">
      <ScrollReveal>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl">shield_person</span>
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface">Super Admin</h1>
            <p className="text-on-surface-variant text-sm mt-1">Sign in to manage hostel access requests</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/10">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>{loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
                <input type="email" className="w-full px-4 py-4 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="superadmin@hms.edu" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
                <input type="password" className="w-full px-4 py-4 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={logging} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
                {logging ? <span className="material-symbols-outlined animate-spin text-base">progress_activity</span> : <span className="material-symbols-outlined text-base">lock_open</span>}
                {logging ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-on-surface-variant mt-4">Demo: superadmin@hms.edu / superadmin123</p>
        </div>
      </ScrollReveal>
    </div>
  );

  // ── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-container-low">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToastMsg(null)} />}

      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">shield_person</span>
          </div>
          <div>
            <div className="font-extrabold text-on-surface text-sm">Super Admin Panel</div>
            <div className="text-xs text-on-surface-variant">Hostel Access Management</div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all">
          <span className="material-symbols-outlined text-base">logout</span> Logout
        </button>
      </header>

      <main className="flex-1 overflow-auto flex flex-col justify-between p-0">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto p-6 md:p-10 mb-12 w-full">

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-outline-variant/10 shadow-sm mb-8 w-fit">
              {SA_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'requests' && pending > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full">{pending}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Admin Requests */}
            {activeTab === 'requests' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Requests', val: requests.length, icon: 'inbox', color: 'text-primary' },
                    { label: 'Pending', val: pending, icon: 'pending', color: 'text-yellow-600' },
                    { label: 'Approved', val: approved, icon: 'check_circle', color: 'text-green-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-sm hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`material-symbols-outlined ${s.color} group-hover:scale-110 transition-transform duration-300`}>{s.icon}</span>
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                      </div>
                      <div className="text-3xl font-extrabold text-on-surface">{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-on-surface">Admin Access Requests</h2>
                    <button onClick={loadRequests} className="text-xs font-bold px-4 py-2 bg-surface-container-high rounded-xl flex items-center gap-1 hover:bg-surface-container-highest transition-all">
                      <span className="material-symbols-outlined text-base">refresh</span> Refresh
                    </button>
                  </div>
                  {loading ? (
                    <div className="text-center py-16 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-16">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">inbox</span>
                      <p className="mt-3 text-on-surface-variant text-sm">No requests yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                          <tr>
                            {['Warden', 'Hostel', 'University', 'Phone', 'Date', 'Status', 'Actions'].map(h => (
                              <th key={h} className="px-5 py-4 text-left font-bold whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {requests.map(r => (
                            <tr key={r.id} className="hover:bg-surface-container-low/40 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-bold text-on-surface">{r.wardenName}</div>
                                <div className="text-xs text-on-surface-variant">{r.email}</div>
                              </td>
                              <td className="px-5 py-4 font-semibold text-on-surface whitespace-nowrap">{r.hostelName}</td>
                              <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">{r.universityName}</td>
                              <td className="px-5 py-4 text-on-surface-variant">{r.phone}</td>
                              <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                              <td className="px-5 py-4"><Badge status={r.status} /></td>
                              <td className="px-5 py-4">
                                {r.status === 'PENDING' && (
                                  <div className="flex gap-2">
                                    <button onClick={() => approve(r.id)} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">✓ Approve</button>
                                    <button onClick={() => reject(r.id)} className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">✕ Reject</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tab: Contact Messages */}
            {activeTab === 'contact' && (
              <ContactMessagesTab token={token} showToast={showToast} />
            )}

            {/* Tab: Bug Reports */}
            {activeTab === 'bugs' && (
              <BugReportsTab token={token} showToast={showToast} />
            )}

          </div>
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}

export default SuperAdminDashboard;
