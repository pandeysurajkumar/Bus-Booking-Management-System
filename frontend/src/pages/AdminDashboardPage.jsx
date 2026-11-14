import React, { useState, useEffect } from 'react';
import {
  Users,
  Bus,
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../api/axios';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'operators' | 'logs'
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [dashRes, usersRes, opRes, logsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/operators'),
        api.get('/admin/audit-logs')
      ]);

      setAnalytics(dashRes.data.data);
      setUsers(usersRes.data.data || []);
      setOperators(opRes.data.data || []);
      setAuditLogs(logsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      setActionMsg(res.data.message);
      await fetchDashboardData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOperatorStatus = async (operatorId) => {
    try {
      const res = await api.patch(`/admin/operators/${operatorId}/toggle-status`);
      setActionMsg(res.data.message);
      await fetchDashboardData();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Aggregating system telemetry & charts...</p>
      </div>
    );
  }

  // Chart Colors
  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  const bookingStatusPie = [
    { name: 'Confirmed', value: analytics?.bookings?.confirmed || 0 },
    { name: 'Cancelled', value: analytics?.bookings?.cancelled || 0 },
    { name: 'Pending', value: analytics?.bookings?.pending || 0 }
  ].filter((item) => item.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Enterprise Administration</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Admin Command Center</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time database aggregation, telemetry, RBAC management, and immutable audit logs.</p>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Analytics & Charts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('operators')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'operators' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Operators ({operators.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'logs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* HIGH-LEVEL METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
              <div className="text-2xl font-black text-gray-900">{analytics?.counts?.customers || 0}</div>
              <span className="text-[11px] text-purple-600 font-semibold">Registered Accounts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
              <div className="text-2xl font-black text-emerald-600">
                ₹{analytics?.revenue?.totalRevenue?.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Confirmed GMV</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Bookings</span>
              <div className="text-2xl font-black text-gray-900">{analytics?.bookings?.total || 0}</div>
              <span className="text-[11px] text-gray-500 font-semibold">
                {analytics?.bookings?.confirmed || 0} confirmed • {analytics?.bookings?.cancelled || 0} cancelled
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">System Occupancy</span>
              <div className="text-2xl font-black text-blue-600">{analytics?.occupancy?.rate || 0}%</div>
              <span className="text-[11px] text-gray-500 font-semibold">
                {analytics?.occupancy?.bookedSeats || 0} / {analytics?.occupancy?.totalSeats || 0} seats
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Fleet</span>
              <div className="text-2xl font-black text-gray-900">{analytics?.counts?.buses || 0} Buses</div>
              <span className="text-[11px] text-gray-500 font-semibold">{analytics?.counts?.routes || 0} Active Routes</span>
            </div>
          </div>

          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 14-Day Booking & Revenue Trend */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Daily Booking & Revenue Trends
                </h3>
                <p className="text-xs text-gray-400">Aggregated bookings over the past 14 days</p>
              </div>

              <div className="h-64 w-full">
                {analytics?.dailyTrends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No trend data available yet
                  </div>
                )}
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Status Distribution
                </h3>
                <p className="text-xs text-gray-400">Confirmed vs Cancelled Bookings</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {bookingStatusPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingStatusPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-gray-400">No bookings to chart</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">User Management</h3>
            <p className="text-xs text-gray-500">View user credentials, RBAC roles, and activate or deactivate accounts</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          u.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATOR MANAGEMENT TABLE */}
      {activeTab === 'operators' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Operator Directory & Approvals</h3>
            <p className="text-xs text-gray-500">Manage registered bus operators and partner fleet licenses</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {operators.map((op) => (
                  <tr key={op._id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">{op.companyName}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{op.registrationNumber}</td>
                    <td className="py-3 px-4 text-gray-500">
                      <div>{op.contactEmail}</div>
                      <div>{op.contactPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">★ {op.rating}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          op.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {op.isActive ? 'Approved' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleOperatorStatus(op._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          op.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {op.isActive ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS TABLE */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">System Security & Audit Trail</h3>
            <p className="text-xs text-gray-500">Immutable ledger tracking auth events, seat locks, bookings, and cancellations</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {auditLogs.slice(0, 30).map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-4 text-gray-400">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-purple-700">{log.action}</td>
                    <td className="py-2.5 px-4 text-gray-700">{log.userEmail || log.role}</td>
                    <td className="py-2.5 px-4 text-gray-500">{log.resource}</td>
                    <td className="py-2.5 px-4 text-gray-500 max-w-xs truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
