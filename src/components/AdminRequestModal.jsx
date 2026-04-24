import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_FIELDS = [
  { name: 'wardenName', label: 'Warden Name', type: 'text', placeholder: 'Rajesh Sharma' },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'warden@hostel.com' },
  { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210' },
  { name: 'address', label: 'Hostel Address / City', type: 'text', placeholder: 'New Delhi, DL 110001' },
  { name: 'password', label: 'Create Password', type: 'password', placeholder: '••••••••' },
];

const HOSTEL_TYPES = ['BOYS', 'GIRLS', 'MIXED'];

const emptyHostel = () => ({ hostelName: '', hostelType: 'MIXED', totalRooms: '' });

function HostelEntry({ index, hostel, onChange, onRemove, showRemove }) {
  return (
    <div className="p-4 bg-surface-container-high/60 rounded-2xl border border-primary/10 space-y-3 relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
          Hostel {index + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Hostel Name
          </label>
          <input
            type="text"
            required
            value={hostel.hostelName}
            onChange={e => onChange('hostelName', e.target.value)}
            placeholder="Green Valley Hostel"
            className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Hostel Type
          </label>
          <select
            value={hostel.hostelType}
            onChange={e => onChange('hostelType', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 transition-all"
          >
            {HOSTEL_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Total Rooms
          </label>
          <input
            type="number"
            min="1"
            max="500"
            required
            value={hostel.totalRooms}
            onChange={e => onChange('totalRooms', e.target.value)}
            placeholder="50"
            className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

function AdminRequestModal({ isOpen, onClose }) {
  const [managementType, setManagementType] = useState('SINGLE');
  const [form, setForm] = useState({
    universityName: '',
    wardenName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    // SINGLE mode
    hostelName: '',
    hostelType: 'MIXED',
    totalRooms: '',
  });
  const [hostels, setHostels] = useState([emptyHostel()]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const validate = () => {
    const errs = {};
    COMMON_FIELDS.forEach(({ name }) => {
      if (!form[name]?.toString().trim()) errs[name] = 'Required';
    });
    if (!form.universityName?.trim()) errs.universityName = 'Required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (form.password && form.password.length < 8) errs.password = 'Min 8 characters';

    if (managementType === 'SINGLE') {
      if (!form.hostelName?.trim()) errs.hostelName = 'Required';
      if (!form.totalRooms) errs.totalRooms = 'Required';
    } else {
      hostels.forEach((h, i) => {
        if (!h.hostelName?.trim()) errs[`hostel_${i}_name`] = 'Required';
        if (!h.totalRooms) errs[`hostel_${i}_rooms`] = 'Required';
      });
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setStatus('loading');
    try {
      const payload = {
        managementType,
        universityName: form.universityName,
        wardenName: form.wardenName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      };

      if (managementType === 'SINGLE') {
        payload.hostelName = form.hostelName;
        payload.hostelType = form.hostelType;
        payload.totalRooms = Number(form.totalRooms);
      } else {
        payload.requestedHostels = hostels.map(h => ({
          hostelName: h.hostelName,
          hostelType: h.hostelType,
          totalRooms: Number(h.totalRooms),
        }));
      }

      const res = await fetch('/api/admin-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit request. Please try again.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setForm({ universityName: '', wardenName: '', email: '', phone: '', address: '', password: '', hostelName: '', hostelType: 'MIXED', totalRooms: '' });
    setHostels([emptyHostel()]);
    setErrors({});
    setStatus('idle');
    setErrorMsg('');
    setManagementType('SINGLE');
    onClose();
  };

  const updateHostel = (idx, key, val) => {
    setHostels(prev => prev.map((h, i) => i === idx ? { ...h, [key]: val } : h));
  };

  const addHostel = () => setHostels(prev => [...prev, emptyHostel()]);
  const removeHostel = (idx) => setHostels(prev => prev.filter((_, i) => i !== idx));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-8 pb-5 bg-gradient-to-br from-primary to-primary-container rounded-t-[2rem] sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase text-white/80 bg-white/10 rounded-full mb-3">
                    Admin Access
                  </span>
                  <h2 className="text-2xl font-extrabold text-white leading-tight">
                    Request Admin Access
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    Fill in your details. Our team will review and activate your account.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-7">
              {/* Success State */}
              {status === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-on-surface mb-2">Request Submitted!</h3>
                  <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                    Your request has been submitted successfully. Our team will review and grant admin access shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-7">
                  {/* Error Banner */}
                  {status === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
                      <span className="material-symbols-outlined text-base mt-0.5">error</span>
                      {errorMsg}
                    </div>
                  )}

                  {/* ── Management Type Toggle ────────────────────────────── */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                      Hostel Management Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: 'SINGLE', icon: 'home', title: 'Single Hostel', desc: 'Manage one hostel' },
                        { val: 'MULTI', icon: 'apartment', title: 'Multi Hostel', desc: 'Manage multiple hostels' },
                      ].map(({ val, icon, title, desc }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => { setManagementType(val); setErrors({}); }}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                            managementType === val
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant/20 bg-surface-container-high/30 hover:border-primary/30'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${managementType === val ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-lg">{icon}</span>
                          </div>
                          <div>
                            <div className={`text-sm font-extrabold ${managementType === val ? 'text-primary' : 'text-on-surface'}`}>
                              {title}
                            </div>
                            <div className="text-xs text-on-surface-variant">{desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Common Fields ─────────────────────────────────────── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Warden Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* University Name — always shown */}
                      <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                          University Name
                        </label>
                        <input
                          type="text"
                          value={form.universityName}
                          onChange={e => setField('universityName', e.target.value)}
                          placeholder="Delhi University"
                          className={`w-full px-4 py-3.5 bg-surface-container-high rounded-xl text-sm outline-none transition-all focus:ring-2 ${errors.universityName ? 'ring-2 ring-red-400' : 'focus:ring-primary/20'}`}
                        />
                        {errors.universityName && <p className="mt-1 text-xs text-red-500">{errors.universityName}</p>}
                      </div>

                      {COMMON_FIELDS.map(({ name, label, type, placeholder }) => (
                        <div key={name} className="group">
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                            {label}
                          </label>
                          <input
                            type={type}
                            value={form[name] || ''}
                            placeholder={placeholder}
                            onChange={e => setField(name, e.target.value)}
                            className={`w-full px-4 py-3.5 bg-surface-container-high rounded-xl text-sm outline-none transition-all focus:ring-2 ${errors[name] ? 'ring-2 ring-red-400' : 'focus:ring-primary/20'}`}
                          />
                          {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── SINGLE MODE — hostel fields ───────────────────────── */}
                  {managementType === 'SINGLE' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Hostel Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1 group">
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                            Hostel Name
                          </label>
                          <input
                            type="text"
                            value={form.hostelName}
                            onChange={e => setField('hostelName', e.target.value)}
                            placeholder="Green Valley Hostel"
                            className={`w-full px-4 py-3.5 bg-surface-container-high rounded-xl text-sm outline-none transition-all focus:ring-2 ${errors.hostelName ? 'ring-2 ring-red-400' : 'focus:ring-primary/20'}`}
                          />
                          {errors.hostelName && <p className="mt-1 text-xs text-red-500">{errors.hostelName}</p>}
                        </div>

                        <div className="group">
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                            Hostel Type
                          </label>
                          <select
                            value={form.hostelType}
                            onChange={e => setField('hostelType', e.target.value)}
                            className="w-full px-4 py-3.5 bg-surface-container-high rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 border-none"
                          >
                            {HOSTEL_TYPES.map(t => (
                              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                        </div>

                        <div className="group">
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                            Total Rooms
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={form.totalRooms}
                            onChange={e => setField('totalRooms', e.target.value)}
                            placeholder="50"
                            className={`w-full px-4 py-3.5 bg-surface-container-high rounded-xl text-sm outline-none transition-all focus:ring-2 ${errors.totalRooms ? 'ring-2 ring-red-400' : 'focus:ring-primary/20'}`}
                          />
                          {errors.totalRooms && <p className="mt-1 text-xs text-red-500">{errors.totalRooms}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── MULTI MODE — dynamic hostel list ─────────────────── */}
                  {managementType === 'MULTI' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                          Hostel List
                          <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full font-extrabold">{hostels.length}</span>
                        </p>
                      </div>

                      <div className="space-y-3">
                        {hostels.map((h, idx) => (
                          <HostelEntry
                            key={idx}
                            index={idx}
                            hostel={h}
                            onChange={(key, val) => updateHostel(idx, key, val)}
                            onRemove={() => removeHostel(idx)}
                            showRemove={hostels.length > 1}
                          />
                        ))}
                      </div>

                      {/* Validation errors for hostels */}
                      {Object.keys(errors).some(k => k.startsWith('hostel_')) && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">error</span>
                          Please fill in all hostel name and room count fields.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={addHostel}
                        className="w-full py-3 border-2 border-dashed border-primary/30 text-primary text-sm font-bold rounded-2xl hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Add Hostel
                      </button>
                    </motion.div>
                  )}

                  {/* ── Submit ────────────────────────────────────────────── */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-4 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="flex-1 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                          Submitting...
                        </>
                      ) : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdminRequestModal;
