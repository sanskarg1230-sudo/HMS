import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FeaturesSection from '../components/FeaturesSection';
import AnimatedSection from '../components/AnimatedSection';
import HomeSkeleton from '../components/HomeSkeleton';
import ScrollReveal from '../components/ScrollReveal';
import AdminRequestModal from '../components/AdminRequestModal';
import API from '../config/api';

const SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Feature Request',
  'Partnership',
  'Bug Report',
];

const EMPTY_FORM = { name: '', email: '', subject: 'General Inquiry', message: '' };

function Home() {
  const { hash } = useLocation();
  const hasSeenSkeleton = sessionStorage.getItem('hms_skeleton_seen');
  const [isLoading, setIsLoading] = useState(!hasSeenSkeleton);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Contact form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (hasSeenSkeleton) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('hms_skeleton_seen', 'true');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash, isLoading]);

  // Validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (!form.subject) e.subject = 'Please select a subject.';
    if (!form.message.trim()) {
      e.message = 'Message is required.';
    } else if (form.message.trim().length < 10) {
      e.message = 'Message must be at least 10 characters.';
    }
    return e;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        setForm(EMPTY_FORM);
      } else {
        setApiError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setApiError('Could not reach the server. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  if (isLoading) return <HomeSkeleton />;

  return (
    <main className="overflow-x-hidden">
      {/* Hero Section */}
      <ScrollReveal>
        <section id="home" className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-tertiary bg-tertiary-fixed rounded-full">Evolution of Living</span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
                Smart Hostel <span className="text-primary">Management</span> System
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-xl">
                Manage student records, room allocation, complaints, and hostel fees efficiently with our all-in-one digital sanctuary.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
                  Get Started
                </button>
                <button className="px-8 py-4 bg-surface-container-lowest text-primary border border-outline-variant/20 font-bold rounded-xl shadow-sm hover:bg-surface-container transition-all active:scale-95">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary-fixed/30 rounded-[3rem] blur-3xl group-hover:bg-primary-fixed/40 transition-all"></div>
              <div className="relative bg-surface-container-lowest p-4 rounded-[2.5rem] shadow-2xl border border-white/40">
                <img
                  alt="Modern hostel campus building"
                  className="rounded-[2rem] w-full h-auto object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkd-qWK663WBiuI1dDK9O8Jq5ZGSHtmwqKQDb4Q1xgzIf8IVBxVLj2F9MYrCP87DHZyUsi78fW-KUVXbo_2_n5d5U_BrxKgRvEvcXBwTEs_aq2wMC129pl8XA_LDdnp_rbcoS9KTeE8NqC8021sYZeynNnMFYwF-zca1hALJVz9e4raZ7_pqfROyxkdolBJm8K8e2Pez2YA_-ir3_FQ6NNIgiXCBeolHoSS3K_-O11zYrYLImXdkzYSFsZSAZP1jAkbULgx7-kpLM"
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Stats Section */}
      <ScrollReveal delay={0.2}>
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: '2.5k+', label: 'Students' },
                { val: '120+',  label: 'Rooms Available' },
                { val: '98%',   label: 'Issues Resolved' },
                { val: '$1.2M', label: 'Processed' },
              ].map(({ val, label }) => (
                <div key={label} className="p-8 bg-surface-container-lowest rounded-2xl text-center shadow-sm">
                  <div className="text-4xl font-extrabold text-primary mb-2">{val}</div>
                  <div className="text-sm font-bold text-on-surface-variant tracking-wider uppercase">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Features */}
      <div id="features"><FeaturesSection /></div>

      {/* About */}
      <div id="about"><AnimatedSection /></div>

      {/* Hostel Owners CTA */}
      <ScrollReveal direction="up">
        <section className="py-20 bg-primary-container relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-on-primary-container bg-primary-fixed/20 rounded-full">For Hostel Owners</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-on-primary-container mb-8">Start Managing Your Hostel Today</h2>
            <p className="text-on-primary-container/80 text-lg mb-10 max-w-2xl mx-auto">
              Streamline your operations, increase occupancy, and provide a superior student experience with our dedicated admin suite.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-5 bg-white text-primary-container font-extrabold rounded-2xl shadow-xl hover:shadow-white/10 transition-all active:scale-95 text-lg"
            >
              Request Admin Access
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-fixed/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </section>
      </ScrollReveal>

      {/* ── Contact / Let's Connect Section ───────────────────────────────── */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="py-24 bg-surface-container-low" id="contact">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

              {/* Left — Contact Info */}
              <div className="lg:col-span-1">
                <h2 className="text-4xl font-extrabold mb-6">Let's Connect</h2>
                <p className="text-on-surface-variant mb-10 leading-relaxed">
                  Ready to transform your hostel management? Contact our solutions team for a personalized walkthrough.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: 'mail',        title: 'Email Us',       detail: 'support@hms.edu' },
                    { icon: 'call',        title: 'Call Center',    detail: '+1 (555) 000-HMS1' },
                    { icon: 'location_on', title: 'Headquarters',   detail: '123 Campus Way, Education District, NY' },
                  ].map(({ icon, title, detail }) => (
                    <div key={icon} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary-container/20 text-primary rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{title}</h4>
                        <p className="text-on-surface-variant text-sm">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Form */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-8 lg:p-12 rounded-[2.5rem] shadow-sm">

                {/* Success State */}
                {submitted ? (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5 animate-[bounce_0.6s_ease-out]">
                      <span className="material-symbols-outlined text-green-500 text-4xl">mark_email_read</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-on-surface mb-3">Message Sent!</h3>
                    <p className="text-on-surface-variant mb-6 max-w-sm leading-relaxed">
                      Your message has been sent successfully. Our team will contact you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form id="contact-form" onSubmit={handleSubmit} noValidate className="space-y-6">

                    {/* API Error Banner */}
                    {apiError && (
                      <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                        <span className="material-symbols-outlined text-base shrink-0">error</span>
                        {apiError}
                      </div>
                    )}

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label
                          htmlFor="contact-name"
                          className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${errors.name ? 'text-red-500' : 'text-on-surface-variant group-focus-within:text-primary'}`}
                        >
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={form.name}
                          onChange={setField('name')}
                          placeholder="John Doe"
                          className={`w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 transition-all text-sm outline-none ${errors.name ? 'ring-2 ring-red-300' : 'focus:ring-primary/20'}`}
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">error</span>{errors.name}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <label
                          htmlFor="contact-email"
                          className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${errors.email ? 'text-red-500' : 'text-on-surface-variant group-focus-within:text-primary'}`}
                        >
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={form.email}
                          onChange={setField('email')}
                          placeholder="john@university.edu"
                          className={`w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 transition-all text-sm outline-none ${errors.email ? 'ring-2 ring-red-300' : 'focus:ring-primary/20'}`}
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">error</span>{errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="group">
                      <label
                        htmlFor="contact-subject"
                        className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${errors.subject ? 'text-red-500' : 'text-on-surface-variant group-focus-within:text-primary'}`}
                      >
                        Subject
                      </label>
                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={setField('subject')}
                        className={`w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 transition-all text-sm outline-none ${errors.subject ? 'ring-2 ring-red-300' : 'focus:ring-primary/20'}`}
                      >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.subject && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">error</span>{errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="group">
                      <label
                        htmlFor="contact-message"
                        className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${errors.message ? 'text-red-500' : 'text-on-surface-variant group-focus-within:text-primary'}`}
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        value={form.message}
                        onChange={setField('message')}
                        placeholder="How can we help you?"
                        rows={4}
                        className={`w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 transition-all text-sm outline-none resize-none ${errors.message ? 'ring-2 ring-red-300' : 'focus:ring-primary/20'}`}
                      />
                      <div className="flex justify-between items-center mt-1.5">
                        {errors.message
                          ? <p className="text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.message}</p>
                          : <span />
                        }
                        <span className={`text-xs ml-auto ${form.message.length < 10 ? 'text-on-surface-variant/50' : 'text-green-600 font-medium'}`}>
                          {form.message.length} chars
                        </span>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      id="contact-submit"
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {submitting
                        ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Sending...</>
                        : <><span className="material-symbols-outlined text-base">send</span> Send Message</>
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <AdminRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}

export default Home;
