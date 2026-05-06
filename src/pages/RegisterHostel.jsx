import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../config/api';

const COMMON_FIELDS = [
  { name: 'wardenName', label: 'Warden Name', type: 'text', placeholder: 'Rajesh Sharma', icon: 'person' },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'warden@hostel.com', icon: 'mail' },
  { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210', icon: 'phone' },
  { name: 'address', label: 'Hostel Address / City', type: 'text', placeholder: 'New Delhi, DL 110001', icon: 'location_on' },
  { name: 'password', label: 'Create Password', type: 'password', placeholder: '••••••••', icon: 'lock' },
];

const HOSTEL_TYPES = ['BOYS', 'GIRLS', 'MIXED'];

const emptyHostel = () => ({ hostelName: '', hostelType: 'MIXED', totalRooms: '' });

function HostelEntry({ index, hostel, onChange, onRemove, showRemove }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 bg-surface-container-high/40 rounded-2xl border border-outline-variant/10 space-y-4 relative"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">domain</span>
          Hostel {index + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
            title="Remove Hostel"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 group">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 group-focus-within:text-primary transition-colors">
            Hostel Name
          </label>
          <input
            type="text"
            required
            value={hostel.hostelName}
            onChange={e => onChange('hostelName', e.target.value)}
            placeholder="Green Valley Hostel"
            className="w-full px-4 py-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 transition-all shadow-sm"
          />
        </div>

        <div className="group">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 group-focus-within:text-primary transition-colors">
            Hostel Type
          </label>
          <select
            value={hostel.hostelType}
            onChange={e => onChange('hostelType', e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 transition-all shadow-sm"
          >
            {HOSTEL_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div className="group">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 group-focus-within:text-primary transition-colors">
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
            className="w-full px-4 py-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/20 transition-all shadow-sm"
          />
        </div>
      </div>
    </motion.div>
  );
}

function RegisterHostel() {
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
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form handling
  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const updateHostel = (idx, key, val) => {
    setHostels(prev => prev.map((h, i) => i === idx ? { ...h, [key]: val } : h));
  };

  const addHostel = () => setHostels(prev => [...prev, emptyHostel()]);
  const removeHostel = (idx) => setHostels(prev => prev.filter((_, i) => i !== idx));

  // Validation
  const validate = () => {
    const errs = {};
    COMMON_FIELDS.forEach(({ name }) => {
      if (!form[name]?.toString().trim()) errs[name] = 'Required';
    });
    if (!form.universityName?.trim()) errs.universityName = 'Required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (form.password && form.password.length < 8) errs.password = 'Must be at least 8 characters';

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
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorElement = document.querySelector('[name="' + Object.keys(errs)[0] + '"]');
      if (firstErrorElement) firstErrorElement.focus();
      return;
    }

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

      const res = await fetch(`${API}/api/admin-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit request. Please try again.');
      setStatus('error');
    }
  };

  // Password strength logic
  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/\d/)) strength += 25;
    if (pass.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const passStrength = calculatePasswordStrength(form.password || '');
  const passStrengthColor = passStrength < 50 ? 'bg-red-400' : passStrength < 100 ? 'bg-orange-400' : 'bg-green-500';

  return (
    <div className="h-screen w-full bg-surface font-body overflow-y-auto overflow-x-hidden hidden-scrollbar">
      {/* ── Left Sidebar: Info Panel & Process (Fixed on Desktop) ────────────────────────────── */}
      <div className="md:fixed top-0 left-0 md:w-5/12 lg:w-4/12 bg-gradient-to-br from-primary to-primary-container text-white p-8 lg:p-12 flex flex-col justify-between md:h-screen overflow-y-auto hidden-scrollbar z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

        <div>
          <Link to="/" className="inline-block text-3xl font-extrabold tracking-tighter text-white mb-12 hover:opacity-80 transition-opacity">
            HMS
          </Link>

          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Create Your Hostel Portal
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-12">
            Digitize hostel operations, student onboarding, complaints, fee tracking, and notices in one secure platform.
          </p>

          {/* Process Timeline */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
            {[
              { icon: 'app_registration', title: 'Register hostel', desc: 'Submit your property details' },
              { icon: 'verified', title: 'Admin approval', desc: 'We verify and activate your account' },
              { icon: 'room_preferences', title: 'Setup rooms/students', desc: 'Configure your hostel layout' },
              { icon: 'rocket_launch', title: 'Start managing', desc: 'Enjoy a digitized workflow' },
            ].map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shrink-0 z-10 mt-1 shadow-lg">
                  <span className="material-symbols-outlined text-[14px]">{step.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{step.title}</h4>
                  <p className="text-white/60 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white/50 text-xl">encrypted</span>
            <span className="text-xs text-white/70 font-medium">Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white/50 text-xl">cloud_done</span>
            <span className="text-xs text-white/70 font-medium">Cloud Hosted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white/50 text-xl">devices</span>
            <span className="text-xs text-white/70 font-medium">Multi-Device Access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white/50 text-xl">speed</span>
            <span className="text-xs text-white/70 font-medium">Fast Onboarding</span>
          </div>
        </div>
      </div>

      {/* ── Right Content: Registration Form ────────────────────────────── */}
      <div className="md:w-7/12 lg:w-8/12 ml-auto bg-surface-container-lowest p-6 md:p-10 lg:p-16 min-h-screen relative">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden mb-8 pb-6 border-b border-outline-variant/20">
          <Link to="/" className="inline-block text-2xl font-extrabold tracking-tighter text-primary mb-4">
            HMS
          </Link>
          <h1 className="text-2xl font-extrabold text-on-surface">Create Your Hostel Portal</h1>
          <p className="text-on-surface-variant text-sm mt-2">Digitize operations securely.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-6xl text-green-500">task_alt</span>
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Request Submitted Successfully!</h2>
              <p className="text-on-surface-variant text-lg max-w-lg mx-auto leading-relaxed mb-10">
                Your hostel registration request has been received. Our team will review your details and activate your HMS admin portal shortly. We will notify you via email.
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                Return to Home
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-10">
              {/* Error Banner */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                      <span className="material-symbols-outlined text-xl mt-0.5">error</span>
                      <div>
                        <strong className="block font-bold mb-1">Submission Failed</strong>
                        {errorMsg}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Section 1: Management Type */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-extrabold text-on-surface">Management Type</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-11">
                  {[
                    { val: 'SINGLE', icon: 'home', title: 'Single Hostel', desc: 'Manage one hostel property' },
                    { val: 'MULTI', icon: 'apartment', title: 'Multi Hostel', desc: 'Manage multiple properties' },
                  ].map(({ val, icon, title, desc }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setManagementType(val); setErrors({}); }}
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        managementType === val
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                          : 'border-outline-variant/20 bg-white hover:border-primary/30 hover:bg-surface-container-lowest'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${managementType === val ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </div>
                      <div>
                        <div className={`text-base font-extrabold mb-1 ${managementType === val ? 'text-primary' : 'text-on-surface'}`}>
                          {title}
                        </div>
                        <div className="text-sm text-on-surface-variant leading-snug">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <hr className="border-outline-variant/20 ml-11" />

              {/* Section 2: Admin Details */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-extrabold text-on-surface">Admin Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-11">
                  {/* University Name */}
                  <div className="group md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                      University / Organization Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">account_balance</span>
                      <input
                        name="universityName"
                        type="text"
                        value={form.universityName}
                        onChange={e => setField('universityName', e.target.value)}
                        placeholder="e.g. Symbiosis University Of Applied Sciences"
                        className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest rounded-xl text-sm outline-none transition-all focus:ring-2 border ${errors.universityName ? 'border-red-400 ring-2 ring-red-400/20' : 'border-outline-variant/20 focus:border-transparent focus:ring-primary/20 shadow-sm'}`}
                      />
                    </div>
                    {errors.universityName && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.universityName}</p>}
                  </div>

                  {/* Common Fields */}
                  {COMMON_FIELDS.map(({ name, label, type, placeholder, icon }) => (
                    <div key={name} className={`group ${name === 'address' ? 'md:col-span-2' : ''}`}>
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors flex justify-between">
                        {label}
                        {name === 'password' && form.password && (
                          <span className={`text-[10px] ${passStrengthColor.replace('bg-', 'text-')}`}>
                            {passStrength < 50 ? 'Weak' : passStrength < 100 ? 'Good' : 'Strong'}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                          {icon}
                        </span>
                        <input
                          name={name}
                          type={name === 'password' && showPassword ? 'text' : type}
                          value={form[name] || ''}
                          placeholder={placeholder}
                          onChange={e => setField(name, e.target.value)}
                          className={`w-full pl-12 ${name === 'password' ? 'pr-12' : 'pr-4'} py-3.5 bg-surface-container-lowest rounded-xl text-sm outline-none transition-all focus:ring-2 border ${errors[name] ? 'border-red-400 ring-2 ring-red-400/20' : 'border-outline-variant/20 focus:border-transparent focus:ring-primary/20 shadow-sm'}`}
                        />
                        {name === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        )}
                      </div>
                      
                      {/* Password Strength Bar */}
                      {name === 'password' && form.password && (
                        <div className="h-1 w-full bg-surface-container-high rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passStrengthColor}`}
                            style={{ width: `${passStrength}%` }}
                          />
                        </div>
                      )}
                      
                      {errors[name] && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors[name]}</p>}
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-outline-variant/20 ml-11" />

              {/* Section 3: Hostel Details */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-extrabold text-on-surface">Hostel Configuration</h3>
                </div>
                
                <div className="ml-11">
                  {managementType === 'SINGLE' ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="sm:col-span-1 group">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                          Hostel Name
                        </label>
                        <input
                          name="hostelName"
                          type="text"
                          value={form.hostelName}
                          onChange={e => setField('hostelName', e.target.value)}
                          placeholder="Green Valley Hostel"
                          className={`w-full px-4 py-3.5 bg-surface-container-lowest rounded-xl text-sm outline-none transition-all focus:ring-2 border ${errors.hostelName ? 'border-red-400 ring-2 ring-red-400/20' : 'border-outline-variant/20 focus:border-transparent focus:ring-primary/20 shadow-sm'}`}
                        />
                        {errors.hostelName && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.hostelName}</p>}
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                          Hostel Type
                        </label>
                        <select
                          value={form.hostelType}
                          onChange={e => setField('hostelType', e.target.value)}
                          className="w-full px-4 py-3.5 bg-surface-container-lowest rounded-xl text-sm outline-none transition-all focus:ring-2 border border-outline-variant/20 focus:border-transparent focus:ring-primary/20 shadow-sm"
                        >
                          {HOSTEL_TYPES.map(t => (
                            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                          Total Rooms Capacity
                        </label>
                        <input
                          name="totalRooms"
                          type="number"
                          min="1"
                          max="500"
                          value={form.totalRooms}
                          onChange={e => setField('totalRooms', e.target.value)}
                          placeholder="50"
                          className={`w-full px-4 py-3.5 bg-surface-container-lowest rounded-xl text-sm outline-none transition-all focus:ring-2 border ${errors.totalRooms ? 'border-red-400 ring-2 ring-red-400/20' : 'border-outline-variant/20 focus:border-transparent focus:ring-primary/20 shadow-sm'}`}
                        />
                        {errors.totalRooms && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.totalRooms}</p>}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <AnimatePresence>
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
                      </AnimatePresence>

                      {/* Validation errors for multi hostels */}
                      {Object.keys(errors).some(k => k.startsWith('hostel_')) && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 p-3 bg-red-50 rounded-xl border border-red-100">
                          <span className="material-symbols-outlined text-sm">error</span>
                          Please fill in all hostel names and room capacities.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={addHostel}
                        className="w-full py-4 border-2 border-dashed border-primary/30 text-primary text-sm font-bold rounded-2xl hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm transition-all flex items-center justify-center gap-2 group"
                      >
                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_circle</span>
                        Add Another Property
                      </button>
                    </motion.div>
                  )}
                </div>
              </section>

              {/* Submit Area */}
              <div className="ml-11 pt-6">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  {status === 'loading' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-2xl relative z-10">progress_activity</span>
                      <span className="relative z-10">Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Submit Registration Request</span>
                      <span className="material-symbols-outlined text-xl relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-on-surface-variant mt-4 font-medium">
                  By submitting this request, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterHostel;
