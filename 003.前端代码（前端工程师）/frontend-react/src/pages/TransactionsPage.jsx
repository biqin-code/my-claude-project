import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserAvatarMenu from '../components/UserAvatarMenu';
import { getCurrentUser } from '../api/auth';

const API_BASE = '/api';

// 格式化金额
function formatAmount(amount) {
  return Math.abs(amount).toFixed(2);
}

// 格式化日期
function formatDateCN(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return '今天';
  if (date.toDateString() === yesterday.toDateString()) return '昨天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 格式化时间
function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toTimeString().slice(0, 5);
}

// API请求
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('finance_token');
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...defaultOptions, ...options });

  if (response.status === 401) {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
    window.location.href = '/login';
    throw new Error('Token已过期，请重新登录');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || '请求失败');
  return data;
}

function TransactionsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 筛选条件
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 弹窗状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('expense');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addNote, setAddNote] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // 添加弹窗分类
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const paymentMethods = ['支付宝', '微信支付', '银行转账', '现金', '公交卡', '医保卡', '滴滴出行'];

  // 加载用户信息和分类
  useEffect(() => {
    async function loadUserAndCategories() {
      try {
        const userResult = await getCurrentUser();
        if (userResult.code === 200) {
          setUser(userResult.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
      try {
        const result = await apiRequest(`${API_BASE}/transactions/categories`);
        if (result.code === 200) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    }
    loadUserAndCategories();
  }, []);

  // 加载记录
  const loadRecords = async () => {
    setLoading(true);
    let url = `${API_BASE}/transactions?page=${currentPage}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (filterType) url += `&type=${filterType}`;
    if (filterCategory) url += `&categoryId=${filterCategory}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    try {
      const result = await apiRequest(url);
      if (result.code === 200) {
        setRecords(result.data.records);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentPage, keyword, filterType, filterCategory, startDate, endDate]);

  // 重置筛选
  const resetFilter = () => {
    setKeyword('');
    setFilterType('');
    setFilterCategory('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setShowFilter(false);
  };

  // 提交记录
  const handleSubmit = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert('请输入有效金额');
      return;
    }
    if (!selectedCategory) {
      alert('请选择分类');
      return;
    }
    if (addType === 'expense' && !selectedPayment) {
      alert('请选择支付方式');
      return;
    }

    setAddLoading(true);
    try {
      const result = await apiRequest(`${API_BASE}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          type: addType,
          categoryId: parseInt(selectedCategory),
          amount: parseFloat(addAmount),
          note: addNote,
          paymentMethod: addType === 'expense' ? selectedPayment : ''
        })
      });

      if (result.code === 200) {
        alert('添加成功！');
        setShowAddModal(false);
        setAddAmount('');
        setAddNote('');
        setSelectedCategory(null);
        setSelectedPayment(null);
        setCurrentPage(1);
      } else {
        alert(result.message || '添加失败');
      }
    } catch (error) {
      console.error('添加记录失败:', error);
      alert('添加失败，请稍后重试');
    } finally {
      setAddLoading(false);
    }
  };

  // 按日期分组
  const groupedRecords = records.reduce((acc, record) => {
    const dateKey = record.transactionDate;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  // 渲染分页
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(<button key={1} onClick={() => setCurrentPage(1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary shadow-md hover:bg-primary hover:text-white transition-all">1</button>);
      if (startPage > 2) pages.push(<span key="ellipsis1" className="text-on-surface-variant px-2">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} onClick={() => setCurrentPage(i)} className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all ${i === currentPage ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary hover:text-white'}`}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="ellipsis2" className="text-on-surface-variant px-2">...</span>);
      pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary shadow-md hover:bg-primary hover:text-white transition-all">{totalPages}</button>);
    }

    return (
      <div className="fixed bottom-20 md:bottom-4 left-0 right-0 md:left-auto md:right-8 flex justify-center items-center z-40">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
          )}
          {pages}
          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* 侧边导航 */}
      <aside className="h-screen w-64 left-0 hidden md:flex flex-col bg-surface-container-low p-6 gap-3 fixed z-40">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <UserAvatarMenu user={user} />
            <div className="text-lg font-bold text-primary">我的账本</div>
          </div>
          <div className="text-sm text-on-surface-variant opacity-70">财务管理系统</div>
        </div>

        <nav className="flex flex-col gap-3 flex-grow">
          <Link to="/dashboard" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span>首页概览</span>
          </Link>
          <Link to="/transactions" className="bg-primary-container text-on-primary-container rounded-full font-semibold flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>收支明细</span>
          </Link>
          <Link to="/statistics" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">analytics</span>
            <span>统计报表</span>
          </Link>
          <Link to="/budget" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>预算管理</span>
          </Link>
          <Link to="/settings" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span>设置</span>
          </Link>
        </nav>

        <button className="mt-auto bg-primary text-on-primary py-3 px-6 rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md" onClick={() => setShowAddModal(true)}>
          <span className="material-symbols-outlined">add</span>
          <span>记一笔</span>
        </button>
      </aside>

      {/* 主内容 */}
      <main className="flex-grow md:ml-64 flex flex-col min-h-screen pb-24 md:pb-8">
        {/* 顶部导航 */}
        <header className="w-full top-0 sticky z-30 shadow-sm bg-surface flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <UserAvatarMenu user={user} />
              <div className="text-xl font-bold text-primary">我的账本</div>
            </div>
            <div className="hidden md:block text-xl font-semibold text-primary">收支明细</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors" onClick={() => setShowFilter(!showFilter)}>
              <span className="material-symbols-outlined text-primary">filter_list</span>
            </button>
          </div>
        </header>

        {/* 筛选区域 - 固定在顶部导航下方，不随页面滚动 */}
        <div className={`px-6 py-4 bg-surface border-b border-outline-variant/20 sticky top-16 z-30 ${showFilter ? 'block' : 'hidden'}`}>
          <div className="max-w-3xl mx-auto space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                placeholder="搜索备注..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 筛选条件 */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface-container rounded-full text-sm text-on-surface-variant outline-none cursor-pointer"
              >
                <option value="">全部类型</option>
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface-container rounded-full text-sm text-on-surface-variant outline-none cursor-pointer"
              >
                <option value="">全部分类</option>
                {[...expenseCategories, ...incomeCategories].map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface-container rounded-full text-sm text-on-surface-variant outline-none cursor-pointer"
              />
              <span className="text-on-surface-variant self-center">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface-container rounded-full text-sm text-on-surface-variant outline-none cursor-pointer"
              />
            </div>

            <button onClick={resetFilter} className="text-sm text-primary hover:underline">清除筛选</button>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="flex-grow overflow-y-auto px-6 pt-4 md:pt-4 md:px-8 py-4 max-w-3xl mx-auto w-full pb-32">
          {loading ? (
            <div className="text-center py-8 text-on-surface-variant">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">暂无记录</div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a)).map(date => {
                const dayRecords = groupedRecords[date];
                const dayTotal = dayRecords.reduce((sum, r) => sum + (r.type === 'expense' ? Math.abs(r.amount) : 0), 0);

                return (
                  <div key={date} className="relative">
                    {/* 日期标题 - 固定在顶部 */}
                    <div className="py-2 mb-2 bg-background">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-on-surface">{formatDateCN(date)}</h2>
                        <span className="text-xs text-on-surface-variant">支出: -¥{formatAmount(dayTotal)}</span>
                      </div>
                    </div>
                    {/* 记录卡片 */}
                    <div className="space-y-3">
                      {dayRecords.map((record, idx) => (
                        <div key={record.id || idx} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: record.category.color + '20' }}>
                              <span className="text-xl">{record.category.icon}</span>
                            </div>
                            <div>
                              <div className="font-medium text-on-surface">{record.note || record.category.name}</div>
                              <div className="text-sm text-on-surface-variant">{record.category.name} • {formatTime(record.createdAt)}</div>
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${record.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                            {record.type === 'expense' ? '-' : '+'}¥{formatAmount(record.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 分页 */}
        {renderPagination()}
      </main>

      {/* 底部导航 (移动端) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 border-t border-outline-variant md:hidden bg-surface shadow-lg rounded-t-xl">
        <Link to="/dashboard" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium">首页</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center bg-primary-container text-on-primary-container rounded-full px-6 py-1">
          <span className="material-symbols-outlined">list_alt</span>
          <span className="text-xs font-medium">明细</span>
        </Link>
        <Link to="/statistics" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">pie_chart</span>
          <span className="text-xs font-medium">统计</span>
        </Link>
        <Link to="/budget" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-xs font-medium">预算</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-medium">设置</span>
        </Link>
      </nav>

      {/* 移动端 FAB */}
      <button className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-xl z-50" onClick={() => setShowAddModal(true)}>
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* 记一笔弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl p-6 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-center mb-6">记一笔</h3>

            {/* 类型切换 */}
            <div className="flex gap-3 mb-6">
              <button
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${addType === 'expense' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                onClick={() => { setAddType('expense'); setSelectedCategory(null); }}
              >
                支出
              </button>
              <button
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${addType === 'income' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                onClick={() => { setAddType('income'); setSelectedCategory(null); }}
              >
                收入
              </button>
            </div>

            {/* 金额 */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-4xl font-bold">
                <span className="text-on-surface-variant">¥</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-40 text-center bg-transparent outline-none text-on-surface"
                />
              </div>
            </div>

            {/* 分类 */}
            <div className="mb-6">
              <p className="text-sm text-on-surface-variant mb-3">选择分类</p>
              <div className="grid grid-cols-4 gap-3">
                {(addType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'ring-2 ring-primary bg-primary-container' : 'bg-surface-container'}`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            {addType === 'expense' && (
              <div className="mb-6">
                <p className="text-sm text-on-surface-variant mb-3">支付方式</p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map(method => (
                    <button
                      key={method}
                      onClick={() => setSelectedPayment(method)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${selectedPayment === method ? 'ring-2 ring-primary bg-primary-container' : 'bg-surface-container text-on-surface-variant'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 备注 */}
            <div className="mb-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">edit_note</span>
                <input
                  type="text"
                  placeholder="添加备注..."
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={addLoading}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {addLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
