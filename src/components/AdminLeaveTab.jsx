import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

// ── Leave Status Badge ─────────────────────────────────────────────────────────
const LeaveStatusBadge = ({ status }) => {
  const map = {
    PENDING:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
    APPROVED: 'bg-green-100 text-green-700 border border-green-200',
    REJECTED: 'bg-red-100 text-red-600 border border-red-200',
  };
  const icons = { PENDING: 'schedule', APPROVED: 'check_circle', REJECTED: 'cancel' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className="material-symbols-outlined text-[11px]">{icons[status] || 'help'}</span>
      {status}
    </span>
  );
};

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ icon, message }) => (
  <div className="text-center py-20">
    <div className="w-16 h-16 rounded-2xl bg-surface-container-high mx-auto mb-4 flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">{icon}</span>
    </div>
    <p className="text-on-surface-variant text-sm">{message}</p>
  </div>
);

// ── Create Leave Modal ─────────────────────────────────────────────────────────
function CreateLeaveModal({ students, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({ studentId: '', fromDate: '', toDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.fromDate || !form.toDate || !form.reason) {
      toast('Please fill all fields', 'error');
      return;
    }
    setSaving(true);
    const res = await api.post(`/api/admin/students/${form.studentId}/leave`, {
      fromDate: form.fromDate,
      toDate: form.toDate,
      reason: form.reason,
    }).catch(() => ({ error: true }));
    setSaving(false);
    if (res?.id || (res && !res.error)) {
      toast('Leave entry created!', 'success');
      onSuccess();
      onClose();
    } else {
      toast(res?.message || 'Failed to create leave', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-outline-variant/10 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">event_available</span>
            </div>
            <div>
              <div className="font-extrabold text-on-surface">Create Leave Entry</div>
              <div className="text-xs text-on-surface-variant">Add a leave record for a student</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-base">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-7 space-y-5">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Student *
            </label>
            <select required
              value={form.studentId}
              onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/10">
              <option value="">Select a student…</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Leave Date *
              </label>
              <input type="date" required
                value={form.fromDate}
                onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/10" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Expected Return *
              </label>
              <input type="date" required
                value={form.toDate}
                onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/10" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Reason *
            </label>
            <textarea required rows={3}
              value={form.reason}
              onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="State the reason for leave…"
              className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none border border-outline-variant/10" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {saving
                ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-base">add</span>}
              {saving ? 'Creating…' : 'Create Entry'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Leave Tab ───────────────────────────────────────────────────────
export default function AdminLeaveTab({ toast, students }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    // Try the all-leaves endpoint; fall back to fetching per student via individual calls
    api.get('/api/admin/leaves')
      .then(d => { if (Array.isArray(d)) setLeaves(d); else setLeaves([]); })
      .catch(() => setLeaves([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const actionLeave = async (leaveId, action) => {
    const res = await api.put(`/api/admin/leave/${leaveId}/${action}`, {}).catch(() => ({ error: true }));
    if (res?.id || (res && !res.error)) {
      toast(`Leave ${action}d!`, 'success');
      load();
    } else {
      toast('Action failed', 'error');
    }
  };

  // Filter logic
  const filtered = leaves.filter(l => {
    const studentName = l.studentName || '';
    const matchName = studentName.toLowerCase().includes(searchName.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const leaveDate = l.fromDate || '';
    const matchDateFrom = !dateFrom || leaveDate >= dateFrom;
    const matchDateTo = !dateTo || leaveDate <= dateTo;
    return matchName && matchStatus && matchDateFrom && matchDateTo;
  });

  // Stats
  const totalLeaves = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Create Modal */}
      {showCreateModal && (
        <CreateLeaveModal
          students={students}
          toast={toast}
          onClose={() => setShowCreateModal(false)}
          onSuccess={load}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leaves', val: totalLeaves, icon: 'event_note', color: 'text-primary bg-primary/10' },
          { label: 'Pending', val: pendingCount, icon: 'schedule', color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Approved', val: approvedCount, icon: 'check_circle', color: 'text-green-600 bg-green-50' },
          { label: 'Rejected', val: rejectedCount, icon: 'cancel', color: 'text-red-600 bg-red-50' },
        ].map(stat => (
          <div key={stat.label}
            className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 flex items-center gap-3 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <span className="material-symbols-outlined text-xl">{stat.icon}</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-on-surface">{stat.val}</div>
              <div className="text-xs text-on-surface-variant font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Actions Bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
            <input
              type="text"
              placeholder="Search by student name…"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 whitespace-nowrap">
            <span className="material-symbols-outlined text-base">add</span>
            Create Leave Entry
          </button>
        </div>

        {/* Date Range Row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs font-bold text-on-surface-variant">Date range:</span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">calendar_today</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="pl-8 pr-3 py-2 bg-surface-container-high rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/10 text-on-surface" />
          </div>
          <span className="text-on-surface-variant text-xs font-bold">to</span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">calendar_today</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="pl-8 pr-3 py-2 bg-surface-container-high rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/10 text-on-surface" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-xs text-primary font-bold hover:underline">Clear</button>
          )}
        </div>

        {/* Active filter chips */}
        {(searchName || statusFilter !== 'ALL' || dateFrom || dateTo) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-on-surface-variant font-medium">Active filters:</span>
            {searchName && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Name: {searchName}
                <button onClick={() => setSearchName('')} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('ALL')} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            <button
              onClick={() => { setSearchName(''); setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-on-surface-variant hover:text-on-surface underline ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
            <span className="text-sm text-on-surface-variant font-medium">Loading leave records…</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="event_busy" message={leaves.length === 0 ? 'No leave records yet. Create the first entry.' : 'No records match your filters.'} />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider text-left">
                  <tr>
                    {['Student', 'Room', 'Leave Date', 'Return Date', 'Reason', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filtered.map(l => (
                    <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-extrabold shrink-0">
                            {(l.studentName || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-on-surface whitespace-nowrap">{l.studentName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant text-xs font-medium">
                        {l.roomNumber ? `Room ${l.roomNumber}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">
                        {l.fromDate ? new Date(l.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">
                        {l.toDate ? new Date(l.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-on-surface max-w-[180px]">
                        <p className="truncate text-xs" title={l.reason}>{l.reason || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <LeaveStatusBadge status={l.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {l.status === 'PENDING' && (
                            <>
                              <button onClick={() => actionLeave(l.id, 'approve')}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">
                                <span className="material-symbols-outlined text-sm">check</span> Approve
                              </button>
                              <button onClick={() => actionLeave(l.id, 'reject')}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
                                <span className="material-symbols-outlined text-sm">close</span> Reject
                              </button>
                            </>
                          )}
                          {l.status !== 'PENDING' && l.actionedBy && (
                            <div className="text-[10px] text-on-surface-variant">by {l.actionedBy}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-outline-variant/10">
              {filtered.map(l => (
                <div key={l.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-extrabold">
                        {(l.studentName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface text-sm">{l.studentName || '—'}</div>
                        <div className="text-xs text-on-surface-variant">{l.roomNumber ? `Room ${l.roomNumber}` : 'No Room'}</div>
                      </div>
                    </div>
                    <LeaveStatusBadge status={l.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-container-high rounded-xl p-3">
                      <div className="text-on-surface-variant font-bold mb-0.5">Leave Date</div>
                      <div className="text-on-surface font-medium">{l.fromDate || '—'}</div>
                    </div>
                    <div className="bg-surface-container-high rounded-xl p-3">
                      <div className="text-on-surface-variant font-bold mb-0.5">Return Date</div>
                      <div className="text-on-surface font-medium">{l.toDate || '—'}</div>
                    </div>
                  </div>

                  {l.reason && (
                    <div className="text-xs text-on-surface-variant bg-surface-container-high rounded-xl p-3">
                      <span className="font-bold text-on-surface">Reason: </span>{l.reason}
                    </div>
                  )}

                  {l.status === 'PENDING' && (
                    <div className="flex gap-2 w-full">
                      <button onClick={() => actionLeave(l.id, 'approve')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
                        <span className="material-symbols-outlined text-sm">check</span> Approve
                      </button>
                      <button onClick={() => actionLeave(l.id, 'reject')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-surface-container-low/50 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Showing <strong className="text-on-surface">{filtered.length}</strong> of <strong className="text-on-surface">{leaves.length}</strong> records
              </span>
              {filtered.length < leaves.length && (
                <button onClick={() => { setSearchName(''); setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); }}
                  className="text-xs text-primary font-bold hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
