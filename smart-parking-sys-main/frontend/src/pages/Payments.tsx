import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { paymentAPI } from '../services/api';
import { CreditCard, ArrowUpRight, ArrowDownRight, Filter, Loader2 } from 'lucide-react';
import type { Payment } from '../types';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await paymentAPI.getHistory({ limit: 50 });
      setPayments(res.data.payments || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  const methodIcons: Record<string, string> = {
    UPI: '📱', CREDIT_CARD: '💳', DEBIT_CARD: '💳', WALLET: '👛', NET_BANKING: '🏦', CASH: '💵',
  };

  const statusColor: Record<string, string> = {
    COMPLETED: 'badge-success', PENDING: 'badge-warning', FAILED: 'badge-danger', REFUNDED: 'badge-info',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Payment History</h1>
        <p className="text-dark-400 mt-1">Track all your transactions</p>
      </div>

      <div className="glass-card p-6 flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm text-dark-400">Total Spent</p>
          <p className="text-3xl font-display font-bold text-white">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-dark-400">Transactions</p>
          <p className="text-xl font-bold text-white">{payments.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <CreditCard className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No payments yet</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Transaction</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Method</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="table-row"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{p.description || 'Parking Payment'}</p>
                    <p className="text-xs text-dark-500 font-mono">{p.transactionId?.slice(0, 20)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-dark-300">{methodIcons[p.method]} {p.method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-white">₹{p.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusColor[p.status]}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
