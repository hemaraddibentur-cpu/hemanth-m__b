import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ParkingCircle, Mail, Lock, User, Phone, Building, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { registerUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'STUDENT', department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    dispatch(clearError());
    const { confirmPassword, ...data } = formData;
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  };

  const roles = ['STUDENT', 'FACULTY', 'STAFF', 'VISITOR'];

  return (
    <div className="min-h-screen flex bg-dark-950">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative text-center px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center mx-auto mb-8">
              <ParkingCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">Join ParkSmart</h1>
            <p className="text-dark-300 text-lg max-w-md mx-auto">
              Create your account and start managing your campus parking effortlessly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-display font-bold text-white mb-2">Create Account</h2>
          <p className="text-dark-400 mb-8">Fill in your details to get started</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input name="name" value={formData.name} onChange={handleChange} className="input-field !pl-11 !py-2.5" placeholder="John Doe" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input name="phone" value={formData.phone} onChange={handleChange} className="input-field !pl-11 !py-2.5" placeholder="+91-9876543210" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field !pl-11 !py-2.5" placeholder="you@campus.edu" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="input-field !py-2.5">
                  {roles.map(r => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Department</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input name="department" value={formData.department} onChange={handleChange} className="input-field !pl-11 !py-2.5" placeholder="Computer Science" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input-field !pl-11 !pr-11 !py-2.5" placeholder="Min. 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field !pl-11 !py-2.5" placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 !mt-6">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
