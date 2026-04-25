import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationAPI } from '../services/api';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Notification } from '../types';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('All marked as read');
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) { console.error(err); }
  };

  const typeIcons: Record<string, typeof Info> = {
    info: Info, success: CheckCircle, warning: AlertTriangle, error: XCircle,
  };
  const typeColors: Record<string, string> = {
    info: 'text-primary-400 bg-primary-500/10', success: 'text-emerald-400 bg-emerald-500/10',
    warning: 'text-amber-400 bg-amber-500/10', error: 'text-red-400 bg-red-500/10',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
          <p className="text-dark-400 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markRead('all')} className="btn-secondary !py-2 flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Bell className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const Icon = typeIcons[n.type] || Info;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card p-4 flex items-start gap-4 transition-all ${!n.isRead ? 'border-l-2 border-l-primary-500' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[n.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-dark-300'}`}>{n.title}</p>
                  <p className="text-sm text-dark-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-dark-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n.id)} className="p-1.5 text-dark-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all shrink-0">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
