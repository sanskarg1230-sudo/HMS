import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ScrollReveal from '../components/ScrollReveal';

function ActivateAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const data = await api.get(`/api/auth/invite/validate/${token}`);
        if (data.error) {
          setError(data.message || 'Invalid or expired invitation.');
        } else {
          setInvite(data);
        }
      } catch (err) {
        setError('Could not validate invitation. It may be expired or invalid.');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/auth/activate', { token, password });
      if (res.message && !res.error) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(res.message || 'Failed to activate account.');
      }
    } catch (err) {
      setError('Server error during activation. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin material-symbols-outlined text-primary text-4xl">progress_activity</div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl shadow-xl border border-error/20 text-center">
          <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Invitation Error</h2>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="w-full py-3 bg-primary text-white font-bold rounded-xl">Go Home</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl shadow-xl border border-primary/20 text-center">
          <span className="material-symbols-outlined text-primary text-6xl mb-4">check_circle</span>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Account Activated!</h2>
          <p className="text-on-surface-variant mb-6">Your account has been successfully set up. Redirecting you to login...</p>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[progress_3s_linear]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80svh] flex items-center justify-center p-6 bg-surface-container-low">
      <ScrollReveal direction="up" duration={1}>
        <div className="max-w-md w-full bg-surface-container-lowest rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">key</span>
            </div>
            <h2 className="text-3xl font-extrabold text-on-surface leading-tight">Activate Account</h2>
            <p className="text-on-surface-variant mt-2">Welcome, <span className="font-bold text-primary">{invite?.name}</span>. Please set your password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 opacity-60">Email Address</label>
              <input type="text" value={invite?.email} disabled className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-sm outline-none opacity-70 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Set Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  Activating...
                </>
              ) : (
                'Activate Account'
              )}
            </button>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
}

export default ActivateAccount;
