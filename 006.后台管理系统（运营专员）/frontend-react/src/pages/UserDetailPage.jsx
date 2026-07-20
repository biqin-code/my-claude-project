import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserDetail } from '../api/users';

const COLORS = ['#904568', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6366f1', '#14b8a6'];

function UserDetailPage() {
  const { id } = useParams();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetail();
  }, [id]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const result = await getUserDetail(id);
      if (result.code === 200) {
        setUserDetail(result.data);
      }
    } catch (error) {
      console.error('加载用户详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return `¥${(value || 0).toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">用户不存在</p>
        <Link to="/users" className="text-primary hover:underline mt-4 inline-block">
          返回用户列表
        </Link>
      </div>
    );
  }

  const { user, financeOverview, transactionStats, categoryDistribution, recentTransactions } = userDetail;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/users" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">用户详情</h2>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          基本信息
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">用户ID</p>
            <p className="font-medium text-gray-900">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">用户名</p>
            <p className="font-medium text-gray-900">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">昵称</p>
            <p className="font-medium text-gray-900">{user.nickname || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">邮箱</p>
            <p className="font-medium text-gray-900">{user.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">注册时间</p>
            <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">最近登录</p>
            <p className="font-medium text-gray-900">{formatDate(user.last_login)}</p>
          </div>
        </div>
      </div>

      {/* 财务概览 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          财务概览
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-red-500">trending_down</span>
              <span className="text-sm text-red-600">累计支出</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatMoney(financeOverview.totalExpense)}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-green-600">trending_up</span>
              <span className="text-sm text-green-600">累计收入</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatMoney(financeOverview.totalIncome)}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-blue-500">savings</span>
              <span className="text-sm text-blue-500">当前余额</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatMoney(financeOverview.balance)}</p>
          </div>
        </div>
      </div>

      {/* 交易记录统计 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">receipt_long</span>
          交易记录统计
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">支出笔数</p>
            <p className="text-xl font-bold text-red-500">{transactionStats.expenseCount}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">收入笔数</p>
            <p className="text-xl font-bold text-green-600">{transactionStats.incomeCount}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">首次交易日期</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(transactionStats.firstTransactionDate)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">最近交易日期</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(transactionStats.lastTransactionDate)}</p>
          </div>
        </div>
      </div>

      {/* 分类消费分布 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">pie_chart</span>
          分类消费分布
        </h3>
        {categoryDistribution && categoryDistribution.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="total"
                    nameKey="category_name"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {categoryDistribution.map((item, index) => (
                <div key={item.category_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{item.category_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">¥{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">暂无消费数据</p>
        )}
      </div>

      {/* 最近交易记录 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          最近交易记录
        </h3>
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">支付方式</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          tx.type === 'expense'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {tx.type === 'expense' ? '支出' : '收入'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'expense' ? '-' : '+'}¥{Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.category_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.note || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.payment_method || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(tx.transaction_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">暂无交易记录</p>
        )}
      </div>
    </div>
  );
}

export default UserDetailPage;
