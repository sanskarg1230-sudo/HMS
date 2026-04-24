import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ScrollReveal from '../components/ScrollReveal';
import Footer from '../components/Footer';
import MessTab from '../components/MessTab';
import BugReportModal from '../components/BugReportModal';
import StudentProfileModal from '../components/StudentProfileModal';

// ── Reusable UI Primitives ─────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const colors = {
    OPEN: 'bg-red-100 text-red-600',
    RESOLVED: 'bg-green-100 text-green-700',
    PAID: 'bg-green-100 text-green-700',
    UNPAID: 'bg-orange-100 text-orange-600',
    FULL: 'bg-red-100 text-red-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    AVAILABLE: 'bg-green-100 text-green-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-16">
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

// ── Tab Components ─────────────────────────────────────────────────────────────

function RoomsTab({ toast, rooms, students, refreshRooms, refreshStudents }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', type: 'SINGLE', capacity: 1, isAC: false });
  const [assigningRoom, setAssigningRoom] = useState(null); // roomId currently being assigned
  const [assignSearch, setAssignSearch] = useState(''); // text search when assigning
  const [assignFilter, setAssignFilter] = useState('ALL'); // 'ALL', 'UNASSIGNED', 'ASSIGNED'

  const addRoom = async (e) => {
    e.preventDefault();
    const res = await api.post('/admin/rooms', { ...form, capacity: Number(form.capacity) });
    if (res.id) { toast('Room added!', 'success'); setShowForm(false); setForm({ roomNumber: '', type: 'SINGLE', capacity: 1, isAC: false }); refreshRooms(); }
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    let cap = form.capacity;
    if (val === 'SINGLE') cap = 1;
    else if (val === 'DOUBLE') cap = 2;
    else if (val === 'TRIPLE') cap = 3;
    else if (val !== 'CUSTOM') {
      const existing = rooms.find(r => r.type === val);
      if (existing) cap = existing.capacity;
    }
    setForm(p => ({ ...p, type: val, capacity: cap, customType: val === 'CUSTOM' ? '' : undefined }));
  };

  const deleteRoom = async (id) => {
    try {
      const r = await api.delete(`/admin/rooms/${id}`);
      if (r.message && !r.error) { toast(r.message, 'success'); refreshRooms(); }
      else toast(r.message || 'Cannot delete occupied room', 'error');
    } catch (e) { toast('Error deleting room', 'error'); }
  };
  const assignRoom = async (roomId, studentId) => {
    const r = await api.post(`/admin/rooms/${roomId}/assign/${studentId}`);
    if (r.message && !r.error) {
      toast(r.message, 'success'); refreshRooms(); refreshStudents(); setAssigningRoom(null);
    } else {
      toast(r.message || 'Error assigning room', 'error');
    }
  };

  const totalStudents = students.length;
  const totalOccupied = students.filter(s => s.roomId).length;
  const roomsWithSpace = rooms.filter(r => students.filter(s => s.roomId === r.id).length < r.capacity).length;
  const fullRooms = rooms.filter(r => students.filter(s => s.roomId === r.id).length >= r.capacity && r.capacity > 0).length;

  const typeIcon = { SINGLE: 'person', DOUBLE: 'group', TRIPLE: 'groups' };
  const typeColor = { SINGLE: 'text-blue-500 bg-blue-50', DOUBLE: 'text-teal-600 bg-teal-50', TRIPLE: 'text-purple-600 bg-purple-50' };

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Rooms', val: rooms.length, icon: 'bed', color: 'text-primary bg-primary/10' },
          { label: 'Total Students', val: totalStudents, icon: 'people', color: 'text-teal-600 bg-teal-50' },
          { label: 'Beds Filled', val: `${totalOccupied}`, icon: 'person', color: 'text-orange-600 bg-orange-50' },
          { label: 'Rooms Available', val: roomsWithSpace, icon: 'hotel', color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 flex items-center gap-3 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color} group-hover:scale-110 transition-transform duration-300`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-on-surface">{s.val}</div>
              <div className="text-xs text-on-surface-variant font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Header + Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-on-surface">Room Management</h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">add</span> Add Room
        </button>
      </div>

      {/* Add Room Form */}
      {showForm && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const finalForm = { ...form };
          if (form.type === 'CUSTOM' && form.customType) finalForm.type = form.customType;
          api.post('/admin/rooms', { ...finalForm, capacity: Number(form.capacity) }).then(res => {
            if (res.id) { toast('Room added!', 'success'); setShowForm(false); setForm({ roomNumber: '', type: 'SINGLE', capacity: 1, isAC: false }); refreshRooms(); }
          });
        }} className="mb-6 p-5 bg-surface-container-low rounded-2xl flex flex-wrap gap-4 items-end border border-primary/10">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Room No.</label>
            <input className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 w-28 focus:border-primary transition-colors" value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))} placeholder="e.g. 201" required />
          </div>
          {/* Dynamically extract existing custom types */}
          {(() => {
            const standardTypes = ['SINGLE', 'DOUBLE', 'TRIPLE'];
            const customExistingTypes = [...new Set(rooms.map(r => r.type))].filter(t => !standardTypes.includes(t));
            const typeOptions = [...standardTypes, ...customExistingTypes, 'CUSTOM'];

            return (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Type</label>
                <select className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 focus:border-primary transition-colors" value={form.type} onChange={handleTypeChange}>
                  {typeOptions.map(t => <option key={t} value={t}>{t === 'CUSTOM' ? '➕ New Custom Type' : t}</option>)}
                </select>
              </div>
            );
          })()}

          {form.type === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Custom Name</label>
              <input className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 w-32 focus:border-primary transition-colors" value={form.customType || ''} onChange={e => setForm(p => ({ ...p, customType: e.target.value }))} placeholder="e.g. DORM" required />
            </div>
          )}

          {/* Show Capacity for any non-standard type or custom type */}
          {!['SINGLE', 'DOUBLE', 'TRIPLE'].includes(form.type) && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Capacity</label>
              <input type="number" min="1" max="20" className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 w-20 focus:border-primary transition-colors" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} required />
            </div>
          )}

          <div className="flex items-center gap-2 pb-2 ml-2 h-[58px]">
            <input type="checkbox" id="isAC" className="w-4 h-4 text-primary rounded border-outline-variant/20 focus:ring-primary transition-colors cursor-pointer" checked={form.isAC} onChange={e => setForm(p => ({ ...p, isAC: e.target.checked }))} />
            <label htmlFor="isAC" className="text-sm font-bold text-on-surface flex items-center gap-1 cursor-pointer select-none">
              <span className="material-symbols-outlined text-base text-blue-500">ac_unit</span> AC Room
            </label>
          </div>
          <div className="flex-1 flex justify-end gap-3 pb-[1px]">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-surface-container text-on-surface text-sm font-bold rounded-xl hover:bg-surface-container-high transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">Save</button>
          </div>
        </form>
      )}

      {/* Room Cards Grid */}
      {rooms.length === 0 ? <EmptyState icon="bed" message="No rooms yet. Add your first room." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map(room => {
            const occupantsInRoom = students.filter(s => s.roomId === room.id);
            const count = occupantsInRoom.length; // strictly trust actual assigned students
            const isFull = count >= room.capacity;
            const hasSpace = !isFull;
            const fillPct = room.capacity > 0 ? Math.round((count / room.capacity) * 100) : 0;
            const isAssigning = assigningRoom === room.id;

            return (
              <div key={room.id} className={`bg-surface-container-lowest rounded-3xl border transition-all duration-300 ${isFull ? 'border-red-200' : count > 0 ? 'border-yellow-200' : 'border-outline-variant/10'} p-5 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/20`}>
                {/* Room Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black ${typeColor[room.type] || 'text-primary bg-primary/10'}`}>
                      <span className="material-symbols-outlined text-xl">{typeIcon[room.type] || 'bed'}</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-on-surface text-lg leading-tight flex items-center gap-2">
                        Room {room.roomNumber}
                        {room.isAC && <span className="material-symbols-outlined text-blue-500 text-sm" title="AC Room">ac_unit</span>}
                      </div>
                      <div className="text-xs text-on-surface-variant font-medium capitalize flex items-center gap-1">
                        {room.type} {room.isAC ? '• AC' : '• Non-AC'}
                      </div>
                    </div>
                  </div>
                  <Badge status={isFull ? 'FULL' : count > 0 ? 'PARTIAL' : 'AVAILABLE'} />
                </div>

                {/* Capacity Bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-on-surface-variant font-medium">Occupancy</span>
                    <span className="text-xs font-bold text-on-surface">{count}/{room.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : count > 0 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Occupant List */}
                {room.occupantNames && room.occupantNames.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Occupants</div>
                    {room.occupantNames.map((name, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-on-surface flex-1 truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1 flex-wrap">
                  {hasSpace && !isAssigning && (
                    <button
                      onClick={() => { setAssigningRoom(room.id); setAssignSearch(''); setAssignFilter('ALL'); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Assign Student
                    </button>
                  )}

                  {isAssigning && (
                    <div className="w-full flex flex-col bg-surface-container rounded-xl mt-1 border border-primary/20 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2 p-2 border-b border-outline-variant/10 bg-surface-container-high/50">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant pl-1">search</span>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search name or ID..."
                          className="flex-1 text-xs bg-transparent outline-none py-1 placeholder:text-on-surface-variant/50 text-on-surface font-medium"
                          value={assignSearch}
                          onChange={e => setAssignSearch(e.target.value)}
                        />
                        <button onClick={() => setAssigningRoom(null)} className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>

                      {/* Filter Toggles */}
                      <div className="flex px-1 py-1 gap-1 border-b border-outline-variant/10 bg-surface-container-high/20">
                        {['ALL', 'UNASSIGNED', 'ASSIGNED'].map(f => (
                          <button
                            key={f}
                            onClick={() => setAssignFilter(f)}
                            className={`flex-1 text-[9px] py-1 font-bold rounded-lg transition-colors ${assignFilter === f ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      <div className="max-h-40 overflow-y-auto flex flex-col p-1 styled-scrollbar">
                        {(() => {
                          const results = students
                            .filter(s => s.roomId !== room.id)
                            .filter(s => {
                              if (assignFilter === 'UNASSIGNED') return !s.roomId;
                              if (assignFilter === 'ASSIGNED') return !!s.roomId;
                              return true;
                            })
                            .filter(s => s.name?.toLowerCase().includes(assignSearch.toLowerCase()) || s.email?.toLowerCase().includes(assignSearch.toLowerCase()));

                          if (results.length === 0) {
                            return <div className="text-center text-[10px] py-4 text-on-surface-variant font-bold uppercase tracking-wider">No matches found</div>;
                          }

                          return results.slice(0, 30).map(s => (
                            <button
                              key={s.id}
                              onClick={() => assignRoom(room.id, s.id)}
                              className="text-left p-2 rounded-lg hover:bg-primary/10 transition-colors flex flex-col gap-0.5"
                            >
                              <span className="text-xs font-bold text-on-surface flex justify-between items-center">
                                {s.name}
                                {s.roomId && <span className="material-symbols-outlined text-[12px] text-orange-500" title="Will be moved">route</span>}
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-medium">
                                {s.roomId ? `Move from Room ${rooms.find(r => r.id === s.roomId)?.roomNumber || '?'}` : 'New Assignment'} • {s.email?.split('@')[0]}
                              </span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {count === 0 && (
                    <button onClick={() => deleteRoom(room.id)} className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentsTab({ toast, students, rooms, refresh, hostels = [], selectedHostelId, onViewProfile }) {
  const [invites, setInvites] = useState([]);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', hostelId: selectedHostelId || '', roomId: '' });
  const [loading, setLoading] = useState(false);
  const isMulti = hostels.length > 1;
  const [changingRoom, setChangingRoom] = useState(null); // studentId being reassigned

  useEffect(() => { loadInvites(); }, []);
  const loadInvites = () => api.get('/admin/students/invites').then(setInvites).catch(() => { });

  const handleRefresh = () => {
    refresh();
    loadInvites();
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/students/invite', {
        ...inviteForm,
        hostelId: inviteForm.hostelId ? Number(inviteForm.hostelId) : null,
        roomId: inviteForm.roomId ? Number(inviteForm.roomId) : null,
      });
      if (res.message && !res.error) {
        toast(res.message, 'success');
        setShowInviteModal(false);
        setInviteForm({ name: '', email: '', hostelId: selectedHostelId || '', roomId: '' });
        handleRefresh();
      } else {
        toast(res.message || 'Error sending invite', 'error');
      }
    } catch (err) {
      toast('Failed to reach server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelInvite = async (id) => {
    const res = await api.delete(`/admin/students/invites/${id}`);
    if (res.message) { toast(res.message, 'success'); handleRefresh(); }
  };

  const reassignRoom = async (studentId, roomId) => {
    if (!roomId) return;
    const res = await api.post(`/admin/rooms/${roomId}/assign/${studentId}`);
    if (res.message && !res.error) {
      toast('Room updated!', 'success');
      handleRefresh();
    } else {
      toast(res.message || 'Failed to change room', 'error');
    }
    setChangingRoom(null);
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This cannot be undone.')) return;
    const res = await api.delete(`/admin/students/${id}`);
    if (res.message && !res.error) {
      toast(res.message, 'success');
      handleRefresh();
    } else {
      toast(res.message || 'Failed to delete student', 'error');
    }
  };

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10">
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md p-8 rounded-[2rem] shadow-2xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-on-surface">Invite Student</h3>
              <button onClick={() => setShowInviteModal(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">close</button>
            </div>
            <form onSubmit={sendInvite} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Student Name</label>
                <input required className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none" value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))} placeholder="Rahul Kumar" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Student Email</label>
                <input required type="email" className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="rahul@university.edu" />
              </div>
              {isMulti && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Hostel</label>
                  <select required className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none" value={inviteForm.hostelId} onChange={e => setInviteForm(p => ({ ...p, hostelId: e.target.value, roomId: '' }))}>
                    <option value="">Select Hostel</option>
                    {hostels.map(h => <option key={h.id} value={h.id}>{h.hostelName}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Room Assignment (Optional)</label>
                <select className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none" value={inviteForm.roomId} onChange={e => setInviteForm(p => ({ ...p, roomId: e.target.value }))}>
                  <option value="">Select Room</option>
                  {rooms.filter(r => !r.occupied).map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.type})</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <span className="animate-spin material-symbols-outlined text-base">progress_activity</span> : 'Send Invite'}
                </button>
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-6 py-3 bg-surface-container text-on-surface font-bold rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section: Pending Invites */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-on-surface">Pending Invitations</h3>
          <button onClick={() => setShowInviteModal(true)} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined text-lg">person_add</span> Invite Student
          </button>
        </div>

        {invites.filter(i => i.status === 'PENDING').length === 0 ? (
          <div className="bg-surface-container-low/30 rounded-3xl p-8 border border-dashed border-outline-variant/30 text-center">
            <p className="text-sm text-on-surface-variant">No pending invitations. Invite your first student!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invites.filter(i => i.status === 'PENDING').map(i => (
              <div key={i.id} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex justify-between items-center group hover:border-primary/30 transition-all">
                <div>
                  <div className="font-bold text-on-surface">{i.name}</div>
                  <div className="text-xs text-on-surface-variant">{i.email}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">PENDING</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Expires {new Date(i.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => cancelInvite(i.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Active Students */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-on-surface">Active Students</h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="pl-9 pr-4 py-2 bg-surface-container-high rounded-xl text-xs outline-none w-48 focus:w-64 transition-all" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? <EmptyState icon="people" message="No active students found." /> : (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider text-left">
                <tr>{['ID', 'Name', 'Email/Phone', 'Room Info', 'Joined', ''].map((h, i) => <th key={i} className="px-6 py-4 font-bold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-on-surface-variant font-bold">#{s.id}</td>
                    <td className="px-6 py-4 font-bold text-on-surface">{s.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">{s.email}</td>
                    <td className="px-6 py-4">
                      {changingRoom === s.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            autoFocus
                            defaultValue=""
                            onChange={e => reassignRoom(s.id, e.target.value)}
                            className="text-xs px-2 py-1.5 bg-surface-container-high rounded-lg border border-primary/30 outline-none"
                          >
                            <option value="">Select Room</option>
                            {rooms
                              .filter(r => {
                                const count = students.filter(student => student.roomId === r.id).length;
                                const isFull = count >= r.capacity;
                                return !isFull || r.id === s.roomId;
                              })
                              .map(r => {
                                const count = students.filter(student => student.roomId === r.id).length;
                                return (
                                  <option key={r.id} value={r.id} disabled={r.id === s.roomId}>
                                    Room {r.roomNumber} ({r.type}) {r.id === s.roomId ? '← current' : `${count}/${r.capacity}`}
                                  </option>
                                );
                              })}
                          </select>
                          <button onClick={() => setChangingRoom(null)} className="text-xs text-on-surface-variant hover:text-error">
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {s.roomId ? (
                            <>
                              <Badge status="ASSIGNED" />
                              <span className="text-xs text-on-surface-variant font-medium">
                                Room {rooms.find(r => r.id === s.roomId)?.roomNumber || '?'}
                              </span>
                            </>
                          ) : (
                            <span className="text-on-surface-variant text-xs opacity-60">Not Assigned</span>
                          )}
                          <button
                            onClick={() => setChangingRoom(s.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-xs text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onViewProfile && onViewProfile(s)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                          <span className="material-symbols-outlined text-sm">person</span> Profile
                        </button>
                        <button onClick={() => deleteStudent(s.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FeesTab({ toast, students }) {
  const [fees, setFees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', studentName: '', amount: '', month: '', year: new Date().getFullYear(), currency: 'INR' });

  useEffect(() => { load(); }, []);
  const load = () => api.get('/admin/fees').then(setFees).catch(() => { });
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const addFee = async (e) => {
    e.preventDefault();
    const s = students.find(s => String(s.id) === String(form.studentId));
    const res = await api.post('/admin/fees', { ...form, studentName: s?.name || '', amount: Number(form.amount), year: Number(form.year), studentId: Number(form.studentId) });
    if (res.id) { toast('Fee record added!', 'success'); setShowForm(false); load(); }
  };
  const markPaid = async (id) => {
    const res = await api.post(`/admin/fees/${id}/mark-paid`);
    if (res.id) { toast('Marked as paid!', 'success'); load(); }
  };

  const totalCollected = fees.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.status === 'UNPAID').reduce((s, f) => s + f.amount, 0);
  const formatMoney = (val, cur) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur || 'INR' }).format(val || 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-2xl"><div className="text-xs font-bold text-green-600 mb-1">Total Collected</div><div className="text-2xl font-extrabold text-green-700">{formatMoney(totalCollected, fees[0]?.currency || 'INR')}</div></div>
        <div className="bg-orange-50 p-4 rounded-2xl"><div className="text-xs font-bold text-orange-600 mb-1">Total Pending</div><div className="text-2xl font-extrabold text-orange-700">{formatMoney(totalPending, fees[0]?.currency || 'INR')}</div></div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-on-surface">Fee Records</h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl flex items-center gap-1">
          <span className="material-symbols-outlined text-base">add</span> Add Record
        </button>
      </div>
      {showForm && (
        <form onSubmit={addFee} className="mb-6 p-5 bg-surface-container-low rounded-2xl flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Student</label>
            <select className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 w-44" value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Month</label>
            <select className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))}>
              <option value="">Month</option>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Currency</label>
            <select className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 w-24" value={form.currency} onChange={e => setForm(p => ({...p, currency: e.target.value}))}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Amount</label>
            <input type="number" className="px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none border border-outline-variant/20 w-32" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="2000" />
          </div>
          <button type="submit" className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl">Save</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-surface-container text-on-surface text-sm font-bold rounded-xl">Cancel</button>
        </form>
      )}
      {fees.length === 0 ? <EmptyState icon="receipt_long" message="No fee records yet." /> : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
              <tr>{['Student', 'Month/Year', 'Amount', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {fees.map(f => (
                <tr key={f.id} className="hover:bg-surface-container-low/50">
                  <td className="px-4 py-3 font-semibold">{f.studentName || '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{f.month} {f.year}</td>
                  <td className="px-4 py-3 font-bold">{formatMoney(f.amount, f.currency)}</td>
                  <td className="px-4 py-3"><Badge status={f.status} /></td>
                  <td className="px-4 py-3">
                    {f.status === 'UNPAID' && <button onClick={() => markPaid(f.id)} className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">Mark Paid</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ComplaintsTab({ toast }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('ALL');
  useEffect(() => { api.get('/admin/complaints').then(setComplaints).catch(() => { }); }, []);

  const resolve = async (id) => {
    const res = await api.post(`/admin/complaints/${id}/resolve`);
    if (res.id) { toast('Complaint resolved!', 'success'); setComplaints(p => p.map(c => c.id === id ? res : c)); }
  };

  const shown = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['ALL', 'OPEN', 'RESOLVED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filter === f ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>{f}</button>
        ))}
      </div>
      {shown.length === 0 ? <EmptyState icon="report" message="No complaints found." /> : (
        <div className="space-y-3">
          {shown.map(c => (
            <div key={c.id} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${c.status === 'OPEN' ? 'bg-red-500' : 'bg-green-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-on-surface">{c.title}</span>
                  <Badge status={c.status} />
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">{c.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-on-surface-variant">
                  <span>{c.studentName} · Room {c.roomNumber}</span>
                  <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
              {c.status === 'OPEN' && (
                <button onClick={() => resolve(c.id)} className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 shrink-0">Resolve</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoticesTab({ toast }) {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', isPinned: false });

  useEffect(() => { load(); }, []);
  const load = () => api.get('/admin/notices').then(setNotices).catch(() => { });

  const saveNotice = async (e) => {
    e.preventDefault();
    const res = editing ? await api.put(`/admin/notices/${editing.id}`, form) : await api.post('/admin/notices', form);
    if (res.id) { toast(editing ? 'Notice updated!' : 'Notice published!', 'success'); setShowForm(false); setEditing(null); setForm({ title: '', message: '', isPinned: false }); load(); }
  };
  const deleteNotice = async (id) => {
    await api.delete(`/admin/notices/${id}`);
    toast('Notice deleted', 'success'); load();
  };
  const startEdit = (n) => { setEditing(n); setForm({ title: n.title, message: n.message, isPinned: n.isPinned }); setShowForm(true); };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-on-surface">Announcements</h3>
        <button onClick={() => { setEditing(null); setForm({ title: '', message: '', isPinned: false }); setShowForm(true); }} className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl flex items-center gap-1">
          <span className="material-symbols-outlined text-base">add</span> New Notice
        </button>
      </div>
      {showForm && (
        <form onSubmit={saveNotice} className="mb-6 p-5 bg-surface-container-low rounded-2xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Title</label>
            <input className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm outline-none border border-outline-variant/20" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notice title" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Message</label>
            <textarea className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm outline-none border border-outline-variant/20 resize-none" rows="3" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your announcement..." required />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
            <span className="text-sm font-medium text-on-surface">📌 Pin this notice</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl">{editing ? 'Update' : 'Publish'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2.5 bg-surface-container text-on-surface text-sm font-bold rounded-xl">Cancel</button>
          </div>
        </form>
      )}
      {notices.length === 0 ? <EmptyState icon="campaign" message="No announcements yet. Create your first one!" /> : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {n.isPinned && <span className="text-sm">📌</span>}
                    <span className="font-bold text-on-surface">{n.title}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{n.message}</p>
                  <div className="text-xs text-on-surface-variant mt-2">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(n)} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-base">edit</span></button>
                  <button onClick={() => deleteNotice(n.id)} className="p-2 hover:bg-red-50 rounded-lg text-on-surface-variant hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-base">delete</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HostelSettingsTab({ toast }) {
  const [hostel, setHostel] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => { api.get('/admin/hostel').then(h => { setHostel(h); setForm(h); }).catch(() => { }); }, []);

  const save = async (e) => {
    e.preventDefault();
    const res = await api.put('/admin/hostel', form);
    if (res.id) { setHostel(res); setEditing(false); toast('Hostel info updated!', 'success'); }
  };

  if (!hostel) return <EmptyState icon="apartment" message="Loading hostel info..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-on-surface">Hostel Information</h3>
        <button onClick={() => setEditing(!editing)} className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-1 ${editing ? 'bg-surface-container-high text-on-surface' : 'bg-primary text-white'}`}>
          <span className="material-symbols-outlined text-base">{editing ? 'close' : 'edit'}</span> {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[['Hostel Name', hostel.hostelName], ['University', hostel.universityName], ['Address', hostel.address], ['Warden Email', hostel.wardenEmail], ['Warden Phone', hostel.wardenPhone], ['Total Rooms', hostel.roomCount]].map(([label, val]) => (
            <div key={label} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{label}</div>
              <div className="font-semibold text-on-surface">{val || '—'}</div>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[['hostelName', 'Hostel Name'], ['universityName', 'University'], ['address', 'Address'], ['wardenEmail', 'Warden Email'], ['wardenPhone', 'Warden Phone']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}</label>
              <input className="w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none border border-outline-variant/20" value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="md:col-span-2">
            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl">Save Changes</button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ADMIN'); // 'ADMIN' or 'STUDENT'
  useEffect(() => { loadLogs(); }, []);
  const loadLogs = () => api.get('/admin/logs').then(setLogs).catch(() => { });

  const filteredLogs = logs.filter(l => l.source === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-on-surface">Activity Logs</h3>
        {/* Toggle Admin vs Student */}
        <div className="flex p-1 bg-surface-container-high rounded-xl">
          {['ADMIN', 'STUDENT'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeFilter === f ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {f} Logs
            </button>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 ? <EmptyState icon="history" message={`No ${activeFilter.toLowerCase()} activity recorded yet.`} /> : (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-sm relative">
          <div className="absolute top-8 bottom-8 left-10 w-px bg-outline-variant/20 hidden md:block"></div>
          <div className="space-y-8">
            {filteredLogs.map(log => {
              // Decide styling by action type
              let color = 'text-primary bg-primary/10';
              let icon = 'info';
              if (log.actionType.includes('ADDED') || log.actionType.includes('INVITED') || log.actionType.includes('CREATED')) { color = 'text-green-600 bg-green-50'; icon = 'add_circle'; }
              if (log.actionType.includes('DELETED')) { color = 'text-red-500 bg-red-50'; icon = 'delete'; }
              if (log.actionType.includes('ASSIGNED')) { color = 'text-orange-500 bg-orange-50'; icon = 'room_preferences'; }
              if (log.actionType.includes('PAID')) { color = 'text-emerald-500 bg-emerald-50'; icon = 'check_circle'; }
              if (log.actionType.includes('FEE')) { color = 'text-purple-500 bg-purple-50'; icon = 'payments'; }

              const dateObj = new Date(log.timestamp);

              return (
                <div key={log.id} className="flex gap-4 relative z-10 group">
                  <div className="w-16 pt-1 flex flex-col items-end shrink-0 hidden md:flex">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">{dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="text-[10px] text-on-surface-variant">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${color} ring-4 ring-surface-container-lowest`}>
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  </div>
                  <div className="flex-1 bg-surface-container-low/50 hover:bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/5 transition-colors">
                    <div className="text-xs font-bold text-on-surface-variant mb-0.5">{log.actionType.replace(/_/g, ' ')}</div>
                    <div className="text-sm font-medium text-on-surface">{log.details}</div>
                    <div className="text-[10px] text-on-surface-variant mt-2 md:hidden">
                      {dateObj.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'rooms', label: 'Rooms', icon: 'bed' },
  { id: 'students', label: 'Students', icon: 'people' },
  { id: 'fees', label: 'Fees', icon: 'payments' },
  { id: 'mess', label: 'Mess Management', icon: 'restaurant_menu' },
  { id: 'complaints', label: 'Complaints', icon: 'report' },
  { id: 'notices', label: 'Notices', icon: 'campaign' },
  { id: 'logs', label: 'Activity Logs', icon: 'history' },
  { id: 'hostel', label: 'Hostel Settings', icon: 'apartment' },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rooms');
  const [toast, setToastMsg] = useState(null);
  const [profileStudent, setProfileStudent] = useState(null);

  const adminEmail = localStorage.getItem('hms_email');
  const adminName = localStorage.getItem('hms_name') || 'Admin';
  const adminId = localStorage.getItem('hms_user_id');

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [selectedHostelId, setSelectedHostelId] = useState(localStorage.getItem('hms_hostel_id') || '');

  const loadRooms = () => api.get('/admin/rooms').then(setRooms).catch(() => { });
  const loadStudents = () => api.get('/admin/students').then(setStudents).catch(() => { });
  const loadComplaints = () => api.get('/admin/complaints').then(data => {
    if (Array.isArray(data)) setPendingComplaints(data.filter(c => c.status === 'OPEN').length);
  }).catch(() => { });

  const loadHostels = () => api.get('/admin/hostels').then(data => {
    setHostels(data);
    if (!localStorage.getItem('hms_hostel_id') && data.length > 0) {
      const firstId = String(data[0].id);
      setSelectedHostelId(firstId);
      localStorage.setItem('hms_hostel_id', firstId);
    }
  }).catch(() => { });

  // Reactive hostel switch — update localStorage and reload all data without page refresh
  const changeHostel = (id) => {
    setSelectedHostelId(id);
    localStorage.setItem('hms_hostel_id', id);
    loadRooms();
    loadStudents();
    loadComplaints();
    // Tab components with internal state will remount via key prop
  };

  useEffect(() => { loadHostels(); }, []);

  useEffect(() => {
    loadRooms();
    loadStudents();
    loadComplaints();
  }, [selectedHostelId]);

  const activeHostel = hostels.find(h => String(h.id) === String(selectedHostelId));
  const occupiedRooms = rooms.filter(r => r.occupantCount > 0).length;

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_role');
    localStorage.removeItem('hms_email');
    localStorage.removeItem('hms_name');
    localStorage.removeItem('hms_hostel_id');
    navigate('/');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'rooms': return <RoomsTab toast={showToast} rooms={rooms} students={students} refreshRooms={loadRooms} refreshStudents={loadStudents} />;
      case 'students': return <StudentsTab toast={showToast} students={students} rooms={rooms} refresh={loadStudents} hostels={hostels} selectedHostelId={selectedHostelId} onViewProfile={setProfileStudent} />;
      case 'fees': return <FeesTab toast={showToast} students={students} />;
      case 'mess': return <MessTab toast={showToast} api={api} />;
      case 'complaints': return <ComplaintsTab toast={showToast} />;
      case 'notices': return <NoticesTab toast={showToast} />;
      case 'logs': return <LogsTab toast={showToast} />;
      case 'hostel': return <HostelSettingsTab toast={showToast} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToastMsg(null)} />}

      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <div>
              <div className="font-extrabold text-on-surface text-sm">Admin Dashboard</div>
              <div className="text-xs text-on-surface-variant">{adminEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Hostel Switcher — always visible when admin has hostels */}
            {hostels.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 px-3 py-2 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-sm text-primary">apartment</span>
                <select
                  value={selectedHostelId}
                  onChange={e => changeHostel(e.target.value)}
                  className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer max-w-[160px]"
                >
                  {hostels.map(h => (
                    <option key={h.id} value={h.id}>{h.hostelName}</option>
                  ))}
                </select>
                {hostels.length > 1 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                    {hostels.length}
                  </span>
                )}
              </div>
            )}
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all">
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        </div>

        {/* Hostel Stats Bar */}
        {activeHostel && (
          <div className="px-6 pb-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {activeHostel.hostelName}
            </span>
            {activeHostel.hostelType && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                {activeHostel.hostelType}
              </span>
            )}
            <span className="text-on-surface-variant text-[10px]">·</span>
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">bed</span>
              {rooms.length} rooms
            </span>
            <span className="text-on-surface-variant text-[10px]">·</span>
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">hotel</span>
              {occupiedRooms} occupied
            </span>
            <span className="text-on-surface-variant text-[10px]">·</span>
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">people</span>
              {students.length} students
            </span>
            {pendingComplaints > 0 && (
              <>
                <span className="text-on-surface-variant text-[10px]">·</span>
                <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">report</span>
                  {pendingComplaints} open complaints
                </span>
              </>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-white/60 backdrop-blur-sm border-r border-outline-variant/10 p-4 hidden md:block shrink-0 sticky top-[73px] h-[calc(100vh-73px)]">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-primary text-white shadow-sm scale-[1.02]' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:pl-6'}`}
              >
                <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto flex flex-col justify-between">
          <div className="p-6 md:p-8 lg:p-12 mb-10 w-full max-w-full">
            <ScrollReveal key={activeTab + '_' + selectedHostelId}>
              <div className="max-w-5xl mx-auto w-full">
                <h2 className="text-2xl font-extrabold text-on-surface mb-6">{TABS.find(t => t.id === activeTab)?.label}</h2>
                {renderTab()}
              </div>
            </ScrollReveal>
          </div>
        </main>

        {/* Mobile Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/10 flex md:hidden z-40">
          {TABS.slice(0, 5).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <Footer />
      <BugReportModal
        userId={adminId ? Number(adminId) : undefined}
        userEmail={adminEmail}
        role="admin"
        pageUrl="/admin/dashboard"
      />
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudent(null)}
          toast={showToast}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
