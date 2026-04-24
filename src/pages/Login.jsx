import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { api } from '../utils/api';

const LOGIN_URL = '/api/auth/login';
const REGISTER_URL = '/api/auth/register';

function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModel, setShowForgotModel] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.error) {
        setError(res.message);
      } else {
        setShowForgotModel(false);
        alert(res.message || 'Password reset link sent to your email.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setForgotLoading(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  // Sync form mode with URL query parameter (?mode=login | ?mode=register)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') setIsLogin(false);
    else if (mode === 'login') setIsLogin(true);
  }, [searchParams]);

  /**
   * Handles form submission.
   * Calls /api/auth/login (login mode) or /api/auth/register (register mode).
   * On success, redirects based on the user's role.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Password constraint: at least 8 characters
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    const url = isLogin ? LOGIN_URL : REGISTER_URL;
    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'An error occurred. Please try again.');
        return;
      }

      // ✅ Save JWT and user info to localStorage for authenticated API calls
      if (data.token) {
        localStorage.setItem('hms_token', data.token);
        localStorage.setItem('hms_role', data.role);
        localStorage.setItem('hms_email', email);
        if (!isLogin && name) localStorage.setItem('hms_name', name);
      }

      // ✅ Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'student') {
        navigate('/student/dashboard');
      } else if (data.role === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Could not connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80svh] flex items-center justify-center p-6 bg-surface-container-low">
      <ScrollReveal direction="up" duration={1.2}>
        <div className="max-w-4xl w-full bg-surface-container-lowest rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 flex flex-col md:flex-row">

          {/* Left Side - Info Panel */}
          <div className="md:w-1/2 p-12 bg-gradient-to-br from-primary to-primary-container text-white flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              {isLogin ? 'Welcome Back to HMS' : 'Join the Digital Sanctuary'}
            </h2>
            <p className="text-on-primary-container text-lg mb-8 opacity-90 leading-relaxed">
              {isLogin
                ? 'Access your dashboard to manage room allocations, view schedules, and keep your records updated.'
                : 'Register now to experience a smoother, more efficient way of managing student life and hostel facilities.'}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed">shield</span>
                <span className="text-sm font-medium">Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed">bolt</span>
                <span className="text-sm font-medium">Real-time synchronization</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-12">
            <h3 className="text-2xl font-bold text-on-surface mb-8 text-center">Sign In</h3>

            {/* Error Message */}
            {error && (
              <div className="mb-6 px-4 py-3 bg-error-container text-on-error-container text-sm font-medium rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@hms.edu"
                  required
                  className="w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-5 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none pr-12 group-hover:bg-surface-container-highest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
                  <span className="text-xs font-medium text-on-surface-variant">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModel(true)}
                  className="text-xs font-bold text-primary hover:underline underline-offset-4"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </ScrollReveal>
      {/* Forgot Password Modal */}
      {showForgotModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-[32px] p-8 shadow-2xl border border-outline-variant/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-on-surface">Reset Password</h2>
              <button 
                onClick={() => setShowForgotModel(false)}
                className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgot} className="space-y-6">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high rounded-2xl border border-transparent outline-none focus:border-primary focus:ring-4 ring-primary/10 transition-all font-body text-sm"
                  placeholder="name@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              <button
                disabled={forgotLoading}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
