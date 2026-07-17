import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import UserAvatarMenu from '../components/UserAvatarMenu';

const API_BASE = '/api';

// 格式化日期：2026年7月10日 星期五
function formatDateCN(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

// 格式化金额
function formatAmount(amount) {
  return Math.abs(amount).toFixed(2);
}

// 格式化记录日期
function formatRecordDate(dateStr, createdAt) {
  // 优先使用 created_at，因为它包含时间信息
  const dateTimeStr = createdAt || dateStr;
  const date = new Date(dateTimeStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = date.toTimeString().slice(0, 5);

  if (date.toDateString() === today.toDateString()) {
    return '今天 ' + timeStr;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + timeStr;
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
  }
}

// API请求
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('finance_token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...defaultOptions, ...options });

  // 如果是401错误（Token过期或无效），清除本地token并跳转登录页
  if (response.status === 401) {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
    window.location.href = '/login';
    throw new Error('Token已过期，请重新登录');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 今日数据
  const [todayDate, setTodayDate] = useState('');
  const [todayTotal, setTodayTotal] = useState('0.00');
  const [categories, setCategories] = useState([]);
  const [top3Percent, setTop3Percent] = useState(0);

  // 最近记录
  const [recentRecords, setRecentRecords] = useState([]);

  // 全部记录弹窗
  const [showAllModal, setShowAllModal] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingAll, setLoadingAll] = useState(false);

  // 添加弹窗
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('expense');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addNote, setAddNote] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const paymentMethods = ['支付宝', '微信支付', '银行转账', '现金', '公交卡', '医保卡', '滴滴出行'];

  // 加载今日汇总
  async function loadTodaySummary() {
    try {
      const result = await apiRequest(`${API_BASE}/transactions/today-summary`);
      if (result.code === 200) {
        setTodayTotal(formatAmount(result.data.total));
        setCategories(result.data.categories);
        setTop3Percent(result.data.top3Percentage);
      }
    } catch (error) {
      console.error('获取今日汇总失败:', error);
    }
  }

  // 加载最近记录
  async function loadRecentRecords() {
    try {
      const result = await apiRequest(`${API_BASE}/transactions/recent?limit=5`);
      if (result.code === 200) {
        setRecentRecords(result.data);
      }
    } catch (error) {
      console.error('获取最近记录失败:', error);
    }
  }

  // 加载分类
  async function loadCategories() {
    try {
      const result = await apiRequest(`${API_BASE}/transactions/categories`);
      if (result.code === 200) {
        setExpenseCategories(result.data.filter(c => c.type === 'expense'));
        setIncomeCategories(result.data.filter(c => c.type === 'income'));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  }

  // 加载全部记录
  async function loadAllRecords(page) {
    setLoadingAll(true);
    try {
      const result = await apiRequest(`${API_BASE}/transactions?page=${page}`);
      if (result.code === 200) {
        setAllRecords(result.data.records);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取全部记录失败:', error);
    } finally {
      setLoadingAll(false);
    }
  }

  // 初始化数据
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getCurrentUser();
        if (result.code === 200) {
          setUser(result.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    }
    setTodayDate(formatDateCN(new Date()));
    fetchData();
    loadCategories();
    loadTodaySummary();
    loadRecentRecords();
  }, []);

  // 打开全部记录弹窗
  const openAllRecordsModal = () => {
    setShowAllModal(true);
    loadAllRecords(1);
  };

  // 提交记录
  const handleSubmitRecord = async () => {
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
        loadTodaySummary();
        loadRecentRecords();
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

  // 渲染分类按钮
  const renderCategoryBtns = () => {
    const cats = addType === 'expense' ? expenseCategories : incomeCategories;
    return cats.map(cat => (
      <button
        key={cat.id}
        className={`category-btn flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-container transition-all ${selectedCategory === cat.id ? 'ring-2 ring-primary bg-primary-container' : ''}`}
        onClick={() => setSelectedCategory(cat.id)}
      >
        <span className="text-2xl">{cat.icon}</span>
        <span className="text-xs">{cat.name}</span>
      </button>
    ));
  };

  // 渲染分页
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => loadAllRecords(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === i ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 p-4 border-t border-outline-variant/20">
        {currentPage > 1 && (
          <button onClick={() => loadAllRecords(currentPage - 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
        )}
        {pages}
        {currentPage < totalPages && (
          <button onClick={() => loadAllRecords(currentPage + 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-on-background">
      {/* 侧边导航 */}
      <aside className="h-screen w-64 left-0 hidden md:flex flex-col bg-surface-container-low p-6 gap-3 fixed z-40">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative user-menu-container">
              <UserAvatarMenu user={user} />
            </div>
            <div className="text-lg font-bold text-primary">我的账本</div>
          </div>
          <div className="text-sm text-on-surface-variant opacity-70">财务管理系统</div>
        </div>

        <nav className="flex flex-col gap-3 flex-grow">
          <a className="bg-primary-container text-on-primary-container rounded-full font-semibold flex items-center gap-4 px-4 py-3 transition-all" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span>首页概览</span>
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all" href="/transactions">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>收支明细</span>
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all" href="/statistics">
            <span className="material-symbols-outlined">analytics</span>
            <span>统计报表</span>
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all" href="/budget">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>预算管理</span>
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all" href="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span>设置</span>
          </a>
        </nav>

        <button className="mt-auto bg-primary text-on-primary py-3 px-6 rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md" onClick={() => setShowAddModal(true)}>
          <span className="material-symbols-outlined">add</span>
          <span>记一笔</span>
        </button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-grow md:ml-64 flex flex-col min-h-screen pb-24 md:pb-0">
        {/* 顶部导航栏 */}
        <header className="w-full top-0 sticky z-30 shadow-sm bg-surface flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <UserAvatarMenu user={user} />
              <div className="text-xl font-bold text-primary">我的账本</div>
            </div>
            <div className="hidden md:block text-xl font-semibold text-primary">概览</div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="px-6 py-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 今日支出卡片 */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-on-surface mb-1">今日支出</h2>
                  <p className="text-sm text-on-surface-variant">{todayDate}</p>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  预算充足
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8">
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">总计金额</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">¥</span>
                    <span className="text-4xl font-bold text-on-surface">{todayTotal}</span>
                  </div>
                </div>

                <div className="flex-grow max-w-md w-full">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-on-surface-variant">类目占比</span>
                    <span className="text-primary font-medium">前三类占 {top3Percent}%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full flex overflow-hidden">
                    {categories.slice(0, 4).map((cat, idx) => (
                      <div key={idx} className="h-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}></div>
                    ))}
                    {categories.length === 0 && <div className="h-full w-full bg-surface-container"></div>}
                  </div>
                  <div className="flex gap-4 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {categories.slice(0, 3).map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-xs text-on-surface-variant">{cat.icon} {cat.name} ¥{formatAmount(cat.amount)}</span>
                      </div>
                    ))}
                    {categories.length === 0 && <span className="text-xs text-on-surface-variant">暂无消费记录</span>}
                  </div>
                </div>
              </div>
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* 存钱计划卡片 */}
            <div className="md:col-span-4 bg-primary text-on-primary rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">存钱计划</h3>
                <p className="text-sm opacity-80">本月已节省 ¥1,200</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-3xl font-bold">75%</span>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
              </div>
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>

            {/* 最近记录列表 */}
            <div className="md:col-span-12 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-on-surface">最近记录</h3>
                <a className="text-primary text-sm font-medium hover:underline cursor-pointer" onClick={openAllRecordsModal}>查看全部</a>
              </div>
              <div className="flex flex-col">
                {recentRecords.length === 0 ? (
                  <div className="px-6 py-8 text-center text-on-surface-variant">暂无记录</div>
                ) : (
                  recentRecords.map((record, idx) => (
                    <div key={record.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer border-b border-surface-variant/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: record.category.color }}>
                          <span className="text-lg">{record.category.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium text-on-surface">{record.note || record.category.name}</div>
                          <div className="text-sm text-on-surface-variant">{record.category.name} • {formatRecordDate(record.transactionDate, record.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${record.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                          {record.type === 'expense' ? '-' : '+'}¥{formatAmount(record.amount)}
                        </div>
                        <div className="text-xs text-on-surface-variant uppercase tracking-tight">{record.paymentMethod || '-'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部导航栏 (移动端) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface shadow-lg md:hidden border-t border-outline-variant">
        <a className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-6 py-1" href="/dashboard">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium">首页</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant" href="/transactions">
          <span className="material-symbols-outlined">list_alt</span>
          <span className="text-xs font-medium">明细</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant" href="/statistics">
          <span className="material-symbols-outlined">pie_chart</span>
          <span className="text-xs font-medium">统计</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant" href="/budget">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-xs font-medium">预算</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant" href="/settings">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-medium">设置</span>
        </a>
      </nav>

      {/* 全部记录弹窗 */}
      {showAllModal && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAllModal(false)}></div>
          <div className="absolute inset-4 md:inset-y-4 md:right-4 md:left-auto md:w-[450px] bg-surface-container-lowest rounded-3xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-on-surface">全部记录</h3>
                <button onClick={() => setShowAllModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {loadingAll ? (
                <div className="p-6 text-center text-on-surface-variant">加载中...</div>
              ) : allRecords.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant">暂无记录</div>
              ) : (
                allRecords.map((record, idx) => (
                  <div key={record.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors border-b border-surface-variant/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: record.category.color }}>
                        <span className="text-lg">{record.category.icon}</span>
                      </div>
                      <div>
                        <div className="font-medium text-on-surface">{record.note || record.category.name}</div>
                        <div className="text-sm text-on-surface-variant">{record.category.name} • {formatRecordDate(record.transactionDate, record.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${record.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {record.type === 'expense' ? '-' : '+'}¥{formatAmount(record.amount)}
                      </div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-tight">{record.paymentMethod || '-'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {renderPagination()}
          </div>
        </div>
      )}

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

            {/* 金额输入 */}
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

            {/* 分类选择 */}
            <div className="mb-6">
              <p className="text-sm text-on-surface-variant mb-3">选择分类</p>
              <div className="grid grid-cols-4 gap-3">
                {renderCategoryBtns()}
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
                      className={`px-4 py-2 rounded-full text-sm transition-all ${selectedPayment === method ? 'ring-2 ring-primary bg-primary-container' : 'bg-surface-container text-on-surface-variant'}`}
                      onClick={() => setSelectedPayment(method)}
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

            {/* 提交按钮 */}
            <button
              className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              onClick={handleSubmitRecord}
              disabled={addLoading}
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

export default DashboardPage;
