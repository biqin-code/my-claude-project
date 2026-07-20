import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getOverview, getUserTrend, getTransactionTrend } from '../api/dashboard';

function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [userTrend, setUserTrend] = useState([]);
  const [transactionTrend, setTransactionTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, userTrendRes, transactionTrendRes] = await Promise.all([
        getOverview(),
        getUserTrend(),
        getTransactionTrend()
      ]);

      if (overviewRes.code === 200) {
        setOverview(overviewRes.data);
      }
      if (userTrendRes.code === 200) {
        setUserTrend(userTrendRes.data);
      }
      if (transactionTrendRes.code === 200) {
        setTransactionTrend(transactionTrendRes.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(1)}万`;
    }
    return `¥${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">首页仪表盘</h2>
        <div className="flex gap-2">
          <Link
            to="/users"
            className="px-4 py-2 bg-gradient-to-r from-pink-200 to-pink-300 text-white rounded-full hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">group</span>
            用户管理
          </Link>
          <Link
            to="/transactions"
            className="px-4 py-2 bg-gradient-to-r from-pink-200 to-pink-300 text-white rounded-full hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            交易管理
          </Link>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">group</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">总用户数</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500">person_add</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">本月新增</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.monthlyNewUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-500">receipt_long</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">本月交易笔数</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.monthlyTransactions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500">trending_down</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">本月总支出</p>
              <p className="text-2xl font-bold text-red-500">{formatMoney(overview?.monthlyExpense || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500">trending_up</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">本月总收入</p>
              <p className="text-2xl font-bold text-emerald-600">{formatMoney(overview?.monthlyIncome || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户增长趋势 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">用户增长趋势（近30天）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => `日期: ${value}`}
                  formatter={(value) => [`${value}人`, '新增用户']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#904568"
                  strokeWidth={2}
                  dot={{ fill: '#904568', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 交易趋势 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">交易趋势（近30天）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => `日期: ${value}`}
                  formatter={(value, name) => [
                    `¥${value.toFixed(2)}`,
                    name === 'expense' ? '支出' : '收入'
                  ]}
                />
                <Legend formatter={(value) => (value === 'expense' ? '支出' : '收入')} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
