import { useState } from 'react';
import { api } from '../utils/api';

/**
 * BugReportModal — floating bug report button + modal.
 * Props:
 *   userId   : number  — the logged-in user's ID
 *   userEmail: string  — the logged-in user's email
 *   role     : string  — "admin" | "student"
 *   pageUrl  : string  — current page route (e.g. "/admin/dashboard")
 */
export default function BugReportModal({ userId, userEmail, role, pageUrl }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subject: 'Bug Report',
    description: '',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subjects = ['Bug Report', 'System Error', 'Feature Suggestion'];

  const validate = () => {
    const e = {};
    if (!form.subject) e.subject = 'Please select a subject.';
    if (!form.description || form.description.trim().length < 10)
      e.description = 'Description must be at least 10 characters.';
    return e;
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, screenshot: 'Please upload an image file.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, screenshot: 'Image must be smaller than 5MB.' }));
      return;
    }
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, screenshot: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (userId) formData.append('userId', userId);
      if (userEmail) formData.append('userEmail', userEmail);
      formData.append('role', role || 'unknown');
      formData.append('subject', form.subject);
      formData.append('description', form.description.trim());
      formData.append('pageUrl', pageUrl || window.location.pathname);
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await api.upload('/api/bugs/report', formData);
      if (res.message && !res.error) {
        setSubmitted(true);
        setForm({ subject: 'Bug Report', description: '' });
        setScreenshot(null);
        setPreview(null);
      } else {
        setErrors({ api: res.message || 'Failed to submit. Please try again.' });
      }
    } catch {
      setErrors({ api: 'Could not reach the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setErrors({});
      setForm({ subject: 'Bug Report', description: '' });
      setScreenshot(null);
      setPreview(null);
    }, 300);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="bug-report-fab"
        onClick={() => setOpen(true)}
        title="Report a Bug"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full shadow-xl shadow-red-500/30 flex items-center justify-center hover:scale-110 hover:shadow-red-500/50 active:scale-95 transition-all duration-200 group"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">bug_report</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in">
            {/* Header */}
            <div className="px-7 pt-7 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 text-xl">bug_report</span>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-on-surface">Report an Issue</h2>
                  <p className="text-xs text-on-surface-variant">Help us improve the platform</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {submitted ? (
                /* Success State */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                  </div>
                  <h3 className="font-extrabold text-on-surface text-lg mb-2">Report Submitted!</h3>
                  <p className="text-on-surface-variant text-sm mb-6">
                    Thank you for the report. Our team will investigate and get back to you shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* API Error */}
                  {errors.api && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                      <span className="material-symbols-outlined text-base">error</span>
                      {errors.api}
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                      Issue Type
                    </label>
                    <select
                      id="bug-subject"
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className={`w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none transition-all ${errors.subject ? 'ring-2 ring-red-300' : 'focus:ring-2 focus:ring-primary/20'}`}
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.subject}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                      Description
                    </label>
                    <textarea
                      id="bug-description"
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe the issue in detail — what you did, what happened, and what you expected..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-surface-container-high rounded-xl text-sm outline-none resize-none transition-all ${errors.description ? 'ring-2 ring-red-300' : 'focus:ring-2 focus:ring-primary/20'}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description
                        ? <p className="text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.description}</p>
                        : <span />
                      }
                      <span className={`text-xs ml-auto ${form.description.length < 10 ? 'text-on-surface-variant' : 'text-green-600'}`}>
                        {form.description.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                      Screenshot <span className="normal-case font-normal">(optional)</span>
                    </label>
                    {preview ? (
                      <div className="relative rounded-xl overflow-hidden border border-outline-variant/20">
                        <img src={preview} alt="Screenshot preview" className="w-full max-h-40 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setScreenshot(null); setPreview(null); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="bug-screenshot"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all
                          ${errors.screenshot ? 'border-red-300 bg-red-50' : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/40 hover:bg-primary/5'}`}
                      >
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant mb-1">add_photo_alternate</span>
                        <span className="text-xs text-on-surface-variant font-medium">Click to upload a screenshot</span>
                        <span className="text-xs text-on-surface-variant/60">PNG, JPG up to 5MB</span>
                        <input
                          id="bug-screenshot"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshot}
                        />
                      </label>
                    )}
                    {errors.screenshot && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.screenshot}</p>}
                  </div>

                  {/* Page tag */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">link</span>
                    <span className="text-xs text-on-surface-variant">Page: <span className="font-mono font-semibold text-on-surface">{pageUrl || window.location.pathname}</span></span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      id="bug-submit-btn"
                      className="flex-1 py-3.5 bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {submitting
                        ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Submitting...</>
                        : <><span className="material-symbols-outlined text-base">send</span> Submit Report</>
                      }
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-3.5 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
