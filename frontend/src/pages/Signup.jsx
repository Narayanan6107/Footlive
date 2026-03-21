import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ChevronLeft, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        
        setSuccess(data.message || 'Account created successfully!');
        
        // Redirect after short delay to show success message
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-white/30 selection:text-white relative overflow-hidden bg-[#0e0e0e]">

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-gray-500 hover:text-white transition-colors group z-10">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-[460px] animate-in fade-in zoom-in duration-700 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <ShieldCheck size={12} />
            <span>Registration Open</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Start your <span className="text-gray-300">legacy.</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed px-4">
            Join the elite circle of tactical fans. <br/>
            Create your profile and dominate the pitch.
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

        {/* Signup Card */}
        <div className="bg-[#111] rounded-[32px] p-10 overflow-hidden relative border border-[#222] shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#333] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder-gray-600 text-sm"
                  placeholder="pep_guardiola"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#333] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder-gray-600 text-sm"
                  placeholder="pep@city.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#333] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder-gray-600 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full bg-[#0e0e0e] border border-[#333] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder-gray-600 text-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] text-gray-600 ml-1 font-medium italic">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-black font-black py-4 rounded-2xl mt-6 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              <span className="text-sm tracking-widest uppercase">{loading ? 'Processing...' : 'Deploy Profile'}</span>
              {!loading && <ArrowRight size={18} strokeWidth={3} />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs font-medium">
              Already have credentials?{' '}
              <Link to="/login" className="text-white font-bold hover:text-gray-300 transition-colors underline decoration-white/20 underline-offset-4 ml-1">Log In</Link>
            </p>
          </div>
        </div>

        {/* Footer decoration */}
        <p className="text-center text-[10px] text-gray-600 mt-12 font-bold uppercase tracking-[0.3em]">
          &copy; 2026 Footlive Systems &bull; Elite Tier Access
        </p>
      </div>
    </div>
  );
};

export default Signup;
