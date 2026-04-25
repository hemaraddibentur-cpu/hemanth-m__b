import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, CalendarCheck, CreditCard, Bell, Settings, LogOut,
  Menu, X, Shield, BarChart3, Users, MapPin, AlertTriangle, ChevronDown,
  ParkingCircle
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const role = user?.role || 'STUDENT';

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'SECURITY', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'] },
    { to: '/booking', icon: CalendarCheck, label: 'Book Parking', roles: ['ADMIN', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'] },
    { to: '/my-bookings', icon: MapPin, label: 'My Bookings', roles: ['ADMIN', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'] },
    { to: '/vehicles', icon: Car, label: 'My Vehicles', roles: ['ADMIN', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'] },
    { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['ADMIN', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'] },
    { to: '/security', icon: Shield, label: 'Security', roles: ['ADMIN', 'SECURITY'] },
    { to: '/admin', icon: BarChart3, label: 'Admin Panel', roles: ['ADMIN'] },
    { to: '/admin/users', icon: Users, label: 'User Management', roles: ['ADMIN'] },
    { to: '/admin/violations', icon: AlertTriangle, label: 'Violations', roles: ['ADMIN', 'SECURITY'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'SECURITY', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(role));

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-violet-500',
    SECURITY: 'bg-red-500',
    FACULTY: 'bg-blue-500',
    STAFF: 'bg-emerald-500',
    STUDENT: 'bg-amber-500',
    VISITOR: 'bg-cyan-500',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:relative z-40 w-72 h-full bg-dark-900/95 backdrop-blur-xl border-r border-dark-800 flex flex-col"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                <ParkingCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold gradient-text">ParkSmart</h1>
                <p className="text-[10px] text-dark-400 uppercase tracking-wider">Campus Parking</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {filteredLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-dark-800 p-4">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-dark-800 rounded-xl p-2 transition-colors"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={`w-10 h-10 rounded-full ${roleColors[role]} flex items-center justify-center text-white font-bold text-sm`}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-dark-400 capitalize">{role.toLowerCase()}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-dark-400 hover:text-white transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="hidden md:block">
              <h2 className="text-sm font-medium text-dark-300">Welcome back,</h2>
              <p className="text-base font-semibold text-white">{user?.name || 'User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${roleColors[role]}/10 border border-current/20`}>
              <span className={`w-2 h-2 rounded-full ${roleColors[role]}`} />
              <span className={`text-xs font-semibold capitalize`} style={{ color: roleColors[role]?.replace('bg-', '') }}>
                {role.toLowerCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
