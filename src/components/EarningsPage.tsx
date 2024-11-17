import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabaseClient';

interface Transaction {
  id: number;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export function EarningsPage() {
  const { user } = useApp();
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    available: 0,
    transactions: [] as Transaction[]
  });

  useEffect(() => {
    fetchEarnings();
  }, [user]);

  async function fetchEarnings() {
    if (!user) return;
    
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const total = data.reduce((sum, t) => sum + t.amount, 0);
      const pending = data
        .filter(t => t.type === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      setEarnings({
        total,
        pending,
        available: total - pending,
        transactions: data
      });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Earnings Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold text-gray-900">${earnings.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">${earnings.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Available for Withdrawal</h3>
          <p className="text-2xl font-bold text-green-600">${earnings.available}</p>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Withdraw Earnings</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Available for withdrawal</p>
              <p className="text-2xl font-bold text-green-600">${earnings.available}</p>
            </div>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
              Withdraw to Bank
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Transaction History</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {earnings.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-medium">${transaction.amount}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 