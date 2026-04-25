import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store, RootState } from './store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Vehicles from './pages/Vehicles';
import Payments from './pages/Payments';
import AdminPanel from './pages/AdminPanel';
import SecurityDashboard from './pages/SecurityDashboard';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import ViolationsPage from './pages/ViolationsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const SecurityRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['ADMIN', 'SECURITY'].includes(user?.role || '')) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Security Routes */}
        <Route path="/security" element={<SecurityRoute><SecurityDashboard /></SecurityRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/violations" element={<SecurityRoute><ViolationsPage /></SecurityRoute>} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </Router>
    </Provider>
  );
}

export default App;
