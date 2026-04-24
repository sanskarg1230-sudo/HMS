import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirm) return setError('Passwords do not match');
        
        setLoading(true);
        setError('');
        
        try {
            const res = await api.post('/api/auth/reset-password', { token, password });
            if (res.error) {
                setError(res.message);
            } else {
                setMessage(res.message);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-20 p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Reset Password</h1>
            <p className="text-sm text-on-surface-variant mb-8">Enter your new secure password below.</p>

            {message && (
                <div className="p-4 mb-6 bg-success/10 text-success text-sm rounded-xl border border-success/20">
                    {message} Redirecting to login...
                </div>
            )}

            {error && (
                <div className="p-4 mb-6 bg-error/10 text-error text-sm rounded-xl border border-error/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 bg-surface-container-high rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Confirm Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 bg-surface-container-high rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all"
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
