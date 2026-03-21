import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ChevronLeft, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Auto-hide messages after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        
        setSuccess(data.message || 'Login successful!');
        
        // Redirect after short delay to show success message
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Set error message from API response
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please check if backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-4 selection:bg-[#00ff87] selection:text-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#00ff87]/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00ff87]/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-gray-500 hover:text-white transition-colors group z-10">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-700 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#00ff87] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Identity Access
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Welcome back, <span className="text-[#00ff87]">manager.</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            The pitch is ready. Your tactics are waiting. <br/>
            Sign in to resume your legacy.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-green-300 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="glass rounded-[32px] p-10 overflow-hidden relative border border-white/10 shadow-2xl">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00ff87]/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Command Center Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#00ff87] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00ff87] focus:ring-4 focus:ring-[#00ff87]/5 transition-all placeholder-gray-600 text-sm"
                  placeholder="pep@city.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Security Key</label>
                <Link to="#" className="text-[10px] text-[#00ff87] font-bold hover:brightness-125 transition-all">RECOVER</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#00ff87] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00ff87] focus:ring-4 focus:ring-[#00ff87]/5 transition-all placeholder-gray-600 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff87] hover:bg-[#00e67a] text-black font-black py-4 rounded-2xl mt-6 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_30px_rgba(0,255,135,0.4)]"
            >
              <span className="text-sm tracking-widest uppercase">{loading ? 'Verifying...' : 'Authenticate'}</span>
              {!loading && <ArrowRight size={18} strokeWidth={3} />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs font-medium">
              New to the federation?{' '}
              <Link to="/signup" className="text-white font-bold hover:text-[#00ff87] transition-colors underline decoration-white/20 underline-offset-4 ml-1">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl backdrop-blur-sm">
          <p className="text-blue-300 text-xs font-medium text-center">
            <span className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={16} className="text-blue-400" />
              <span>Demo Credentials:</span>
            </span>
            Email: pep@city.com | Password: password123
          </p>
        </div>

        {/* Footer decoration */}
        <p className="text-center text-[10px] text-gray-600 mt-8 font-bold uppercase tracking-[0.3em]">
          &copy; 2026 Footlive Systems &bull; Secure Protocol
        </p>
      </div>
    </div>
  );
};

export default Login;
