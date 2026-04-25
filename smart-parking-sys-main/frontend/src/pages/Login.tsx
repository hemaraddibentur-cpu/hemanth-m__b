import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ParkingCircle, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { loginUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@campus.edu' },
    { label: 'Security', email: 'security@campus.edu' },
    { label: 'Faculty', email: 'prof.sharma@campus.edu' },
    { label: 'Student', email: 'student.arjun@campus.edu' },
  ];

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative text-center px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center mx-auto mb-8">
              <ParkingCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">ParkSmart</h1>
            <p className="text-dark-300 text-lg max-w-md mx-auto leading-relaxed">
              Intelligent campus parking management. Book, navigate, and pay — all in one platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <ParkingCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">ParkSmart</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-2">Welcome back</h2>
          <p className="text-dark-400 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-11"
                  placeholder="you@campus.edu"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-dark-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-11 !pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <p className="text-xs text-dark-500 text-center mb-3">Quick login (password: password123)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  className="px-3 py-2 text-xs font-medium bg-dark-800/50 border border-dark-700 rounded-lg text-dark-300 hover:text-white hover:border-dark-600 transition-all"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-dark-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
