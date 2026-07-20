import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getIncomeExpenseStats, getCategoryStats, getUserRanking } from '../api/statistics';

const COLORS = ['#904568', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6366f1', '#14b8a6'];

function StatisticsPage() {
  const [incomeExpense, setIncomeExpense] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [userRanking, setUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState('income-expense');

  useEffect(() => {
    loadData();
  }, [year, month]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ieRes, catRes, rankingRes] = await Promise.all([
        getIncomeExpenseStats(year, month),
        getCategoryStats(year, month),
        getUserRanking(year, month)
      ]);

      if (ieRes.code === 200) setIncomeExpense(ieRes.data);
      if (catRes.code === 200) setCategoryStats(catRes.data);
      if (rankingRes.code === 200) setUserRanking(rankingRes.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return `¥${(value || 0).toFixed(2)}`;
  };

  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const tabs = [
    { id: 'income-expense', label: '收支汇总', icon: 'account_balance_wallet' },
    { id: 'category', label: '分类分布', icon: 'pie_chart' },
    { id: 'ranking', label: '用户排行', icon: 'leaderboard' },
  ];

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
        <h2 className="text-2xl font-bold text-gray-800">统计分析</h2>
        {/* 时间选择器 */}
        <div className="flex items-center gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-100 border-2 border-transparent rounded-full focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-100 border-2 border-transparent rounded-full focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
          >
            {getMonthOptions().map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-pink-50 text-pink-500 border-b-2 border-pink-300'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* 收支汇总 */}
          {activeTab === 'income-expense' && incomeExpense && (
            <div className="space-y-6">
              {/* 收支概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-red-500">trending_down</span>
                    <span className="text-sm text-red-600">本月总支出</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{formatMoney(incomeExpense.totalExpense)}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    {incomeExpense.expenseChange >= 0 ? (
                      <span className="text-red-500">↑ {incomeExpense.expenseChange}%</span>
                    ) : (
                      <span className="text-green-600">↓ {Math.abs(incomeExpense.expenseChange)}%</span>
                    )}
                    <span className="text-gray-500">较上月</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-green-600">trending_up</span>
                    <span className="text-sm text-green-600">本月总收入</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatMoney(incomeExpense.totalIncome)}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    {incomeExpense.incomeChange >= 0 ? (
                      <span className="text-green-600">↑ {incomeExpense.incomeChange}%</span>
                    ) : (
                      <span className="text-red-500">↓ {Math.abs(incomeExpense.incomeChange)}%</span>
                    )}
                    <span className="text-gray-500">较上月</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-blue-500">savings</span>
                    <span className="text-sm text-blue-500">本月净收入</span>
                  </div>
                  <p className={`text-2xl font-bold ${incomeExpense.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatMoney(incomeExpense.netIncome)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">收入 - 支出</p>
                </div>
              </div>

              {/* 日均数据 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-gray-500 mb-1">日均支出</p>
                  <p className="text-xl font-bold text-gray-800">{formatMoney(incomeExpense.dailyExpense)}</p>
                  <p className="text-xs text-gray-400 mt-1">共{incomeExpense.currentDay}天</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-gray-500 mb-1">日均收入</p>
                  <p className="text-xl font-bold text-gray-800">{formatMoney(incomeExpense.dailyIncome)}</p>
                  <p className="text-xs text-gray-400 mt-1">共{incomeExpense.currentDay}天</p>
                </div>
              </div>
            </div>
          )}

          {/* 分类分布 */}
          {activeTab === 'category' && categoryStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 支出分类 */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">trending_down</span>
                    支出分类分布
                  </h4>
                  {categoryStats.expenseByCategory && categoryStats.expenseByCategory.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryStats.expenseByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="total"
                              nameKey="category_name"
                            >
                              {categoryStats.expenseByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full space-y-2 mt-4">
                        {categoryStats.expenseByCategory.map((item, index) => (
                          <div key={item.category_name} className="flex items-center justify-between p-3 bg-white rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="text-sm text-gray-700">{item.category_name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-gray-900">¥{item.total.toFixed(2)}</span>
                              <span className="text-xs text-gray-400 ml-2">({item.percent}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">暂无支出数据</p>
                  )}
                </div>

                {/* 收入分类 */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">trending_up</span>
                    收入分类分布
                  </h4>
                  {categoryStats.incomeByCategory && categoryStats.incomeByCategory.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryStats.incomeByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="total"
                              nameKey="category_name"
                            >
                              {categoryStats.incomeByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full space-y-2 mt-4">
                        {categoryStats.incomeByCategory.map((item, index) => (
                          <div key={item.category_name} className="flex items-center justify-between p-3 bg-white rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 4) % COLORS.length] }} />
                              <span className="text-sm text-gray-700">{item.category_name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-gray-900">¥{item.total.toFixed(2)}</span>
                              <span className="text-xs text-gray-400 ml-2">({item.percent}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">暂无收入数据</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 用户排行 */}
          {activeTab === 'ranking' && userRanking && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 支出排行榜 */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">trending_down</span>
                    支出排行榜
                  </h4>
                  {userRanking.expenseRanking && userRanking.expenseRanking.length > 0 ? (
                    <div className="space-y-3">
                      {userRanking.expenseRanking.map((user, index) => (
                        <div key={user.user_id} className="flex items-center gap-4 p-3 bg-white rounded-xl">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {user.rank}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.nickname || user.username}</p>
                            <p className="text-xs text-gray-400">{user.transaction_count}笔交易</p>
                          </div>
                          <p className="font-bold text-red-600">¥{user.total_amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">暂无数据</p>
                  )}
                </div>

                {/* 收入排行榜 */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">trending_up</span>
                    收入排行榜
                  </h4>
                  {userRanking.incomeRanking && userRanking.incomeRanking.length > 0 ? (
                    <div className="space-y-3">
                      {userRanking.incomeRanking.map((user, index) => (
                        <div key={user.user_id} className="flex items-center gap-4 p-3 bg-white rounded-xl">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {user.rank}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.nickname || user.username}</p>
                            <p className="text-xs text-gray-400">{user.transaction_count}笔交易</p>
                          </div>
                          <p className="font-bold text-green-600">¥{user.total_amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">暂无数据</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;
