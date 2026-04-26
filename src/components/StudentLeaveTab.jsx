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

// ── Request Leave Modal ────────────────────────────────────────────────────────
function RequestLeaveModal({ onClose, onSuccess, toast }) {
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) {
      toast('Please fill all fields', 'error');
      return;
    }
    setSaving(true);
    const res = await api.post('/api/student/leave/request', form).catch(() => ({ error: true }));
    setSaving(false);
    if (res?.id) {
      toast('Leave request submitted!', 'success');
      onSuccess();
      onClose();
    } else {
      toast(res?.message || 'Submission failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-outline-variant/10 bg-gradient-to-r from-secondary/5 to-secondary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">flight_takeoff</span>
            </div>
            <div>
              <div className="font-extrabold text-on-surface">Request Leave</div>
              <div className="text-xs text-on-surface-variant">Submit a leave request to the warden</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-base">close</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-7 mt-5 flex items-start gap-3 p-3.5 bg-secondary/5 rounded-xl border border-secondary/15">
          <span className="material-symbols-outlined text-secondary text-base mt-0.5">info</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Your request will be reviewed by the hostel warden. You will be notified once it is approved or rejected.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-7 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Leave Date *
              </label>
              <input type="date" required
                value={form.fromDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/10" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Expected Return *
              </label>
              <input type="date" required
                value={form.toDate}
                min={form.fromDate || new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/10" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Reason *
            </label>
            <textarea required rows={4}
              value={form.reason}
              onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Describe the reason for your leave request…"
              className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all resize-none border border-outline-variant/10" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/20">
              {saving
                ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-base">send</span>}
              {saving ? 'Submitting…' : 'Submit Request'}
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

// ── Main Student Leave Tab ─────────────────────────────────────────────────────
export default function StudentLeaveTab({ toast }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/student/leave')
      .then(d => { if (Array.isArray(d)) setLeaves(d); else setLeaves([]); })
      .catch(() => setLeaves([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Stats
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Request Modal */}
      {showModal && (
        <RequestLeaveModal
          toast={toast}
          onClose={() => setShowModal(false)}
          onSuccess={load}
        />
      )}

      {/* Header Card */}
      <div className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-3xl border border-secondary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary text-3xl">flight_takeoff</span>
          </div>
          <div>
            <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">My Leave</div>
            <div className="text-2xl font-extrabold text-on-surface">{leaves.length} Leave {leaves.length === 1 ? 'Record' : 'Records'}</div>
            {pendingCount > 0 && (
              <div className="text-xs text-yellow-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {pendingCount} pending review
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/25 hover:scale-105 active:scale-95 sm:self-auto w-full sm:w-auto">
          <span className="material-symbols-outlined text-base">add</span>
          Request Leave
        </button>
      </div>

      {/* Quick Stats */}
      {leaves.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', val: leaves.length, color: 'text-on-surface bg-surface-container-lowest', border: 'border-outline-variant/10' },
            { label: 'Pending', val: pendingCount, color: 'text-yellow-700 bg-yellow-50', border: 'border-yellow-100' },
            { label: 'Approved', val: approvedCount, color: 'text-green-700 bg-green-50', border: 'border-green-100' },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.border} ${s.color} text-center transition-all hover:scale-[1.02]`}>
              <div className="text-2xl font-extrabold">{s.val}</div>
              <div className="text-xs font-bold opacity-70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Leave History */}
      <div>
        <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-base">history</span>
          Leave History
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <span className="material-symbols-outlined text-2xl animate-spin text-secondary">progress_activity</span>
            <span className="text-sm text-on-surface-variant">Loading…</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
            <EmptyState icon="event_busy" message="You haven't made any leave requests yet. Click 'Request Leave' to get started." />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider text-left">
                  <tr>
                    {['#', 'Leave Date', 'Expected Return', 'Reason', 'Status', 'Admin Note'].map(h => (
                      <th key={h} className="px-5 py-4 font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {leaves.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-on-surface-variant font-bold">#{idx + 1}</td>
                      <td className="px-5 py-4 font-medium text-on-surface whitespace-nowrap">
                        {l.fromDate ? new Date(l.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">
                        {l.toDate ? new Date(l.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-on-surface max-w-[200px]">
                        <p className="truncate text-xs" title={l.reason}>{l.reason || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <LeaveStatusBadge status={l.status} />
                      </td>
                      <td className="px-5 py-4">
                        {l.adminNote ? (
                          <p className="text-xs text-on-surface-variant italic max-w-[150px] truncate" title={l.adminNote}>
                            {l.adminNote}
                          </p>
                        ) : (
                          <span className="text-xs text-on-surface-variant/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {leaves.map((l, idx) => (
                <div key={l.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 space-y-3 hover:shadow-md hover:border-secondary/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-on-surface-variant font-bold">Request #{idx + 1}</span>
                    <LeaveStatusBadge status={l.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-container-high rounded-xl p-3 text-xs">
                      <div className="text-on-surface-variant font-bold mb-0.5">Leave Date</div>
                      <div className="text-on-surface font-medium">
                        {l.fromDate ? new Date(l.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                    <div className="bg-surface-container-high rounded-xl p-3 text-xs">
                      <div className="text-on-surface-variant font-bold mb-0.5">Return Date</div>
                      <div className="text-on-surface font-medium">
                        {l.toDate ? new Date(l.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                  </div>

                  {l.reason && (
                    <div className="text-xs bg-surface-container-high rounded-xl p-3">
                      <span className="font-bold text-on-surface">Reason: </span>
                      <span className="text-on-surface-variant">{l.reason}</span>
                    </div>
                  )}

                  {l.adminNote && (
                    <div className="flex items-start gap-2 text-xs bg-secondary/5 border border-secondary/15 rounded-xl p-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">admin_panel_settings</span>
                      <div>
                        <div className="font-bold text-secondary mb-0.5">Admin Note</div>
                        <div className="text-on-surface-variant">{l.adminNote}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
