import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatarMenu from '../components/UserAvatarMenu';
import { getBudgets, getBudgetCategories, getCategorySpending, saveBudget, deleteBudget } from '../api/budget';
import { getCurrentUser } from '../api/auth';

const API_BASE = '/api';

// 格式化金额
function formatAmount(amount) {
  return Math.abs(amount).toFixed(2);
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

function BudgetPage() {
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorySpending, setCategorySpending] = useState({});
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overBudgetCount: 0,
  });

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [deleteBudgetId, setDeleteBudgetId] = useState(null);
  const [deleteBudgetName, setDeleteBudgetName] = useState('');

  // 初始化月份选择器
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      options.push({ value, label });
    }
    return options;
  };

  // 加载数据
  const loadData = async () => {
    try {
      // 加载用户信息
      const userResult = await getCurrentUser();
      if (userResult.code === 200) {
        setUser(userResult.data);
      }

      // 加载分类
      const catResult = await getBudgetCategories();
      if (catResult.code === 200) {
        setCategories(catResult.data);
      }

      // 加载预算
      const budgetResult = await getBudgets(currentMonth);
      if (budgetResult.code === 200) {
        setBudgets(budgetResult.data.budgets);
        setSummary(budgetResult.data.summary);
      }

      // 加载分类支出
      const spendingResult = await getCategorySpending(currentMonth);
      if (spendingResult.code === 200) {
        setCategorySpending(spendingResult.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  // 获取已有预算的分类ID列表
  const getBudgetedCategoryIds = () => budgets.map(b => b.categoryId);

  // 打开添加弹窗
  const handleShowAdd = () => {
    setEditingBudgetId(null);
    setSelectedCategoryId(null);
    setBudgetAmount('');
    setShowModal(true);
  };

  // 打开编辑弹窗
  const handleEdit = (budget) => {
    setEditingBudgetId(budget.id);
    setSelectedCategoryId(budget.categoryId);
    setBudgetAmount(budget.budgetAmount.toString());
    setShowModal(true);
  };

  // 打开删除确认
  const handleShowDelete = (budget) => {
    setDeleteBudgetId(budget.id);
    setDeleteBudgetName(budget.categoryName);
    setShowDeleteModal(true);
  };

  // 保存预算
  const handleSave = async () => {
    if (!selectedCategoryId) {
      alert('请选择分类');
      return;
    }
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert('请输入有效的预算金额');
      return;
    }

    try {
      const result = await saveBudget(selectedCategoryId, parseFloat(budgetAmount), currentMonth);
      if (result.code === 200) {
        setShowModal(false);
        await loadData();
      } else {
        alert(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存预算失败:', error);
      alert('保存预算失败，请稍后重试');
    }
  };

  // 确认删除
  const handleDelete = async () => {
    try {
      const result = await deleteBudget(deleteBudgetId);
      if (result.code === 200) {
        setShowDeleteModal(false);
        await loadData();
      } else {
        alert(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除预算失败:', error);
      alert('删除预算失败，请稍后重试');
    }
  };

  // 获取分类已支出金额
  const getCategorySpent = (categoryId) => {
    const spending = categorySpending[categoryId];
    return spending ? spending.spent : 0;
  };

  // 获取已预算分类ID列表（排除当前编辑的）
  const getAvailableCategoryIds = () => {
    const budgeted = getBudgetedCategoryIds();
    if (editingBudgetId) {
      const currentBudget = budgets.find(b => b.id === editingBudgetId);
      if (currentBudget) {
        return budgeted.filter(id => id !== currentBudget.categoryId);
      }
    }
    return budgeted;
  };

  const monthOptions = getMonthOptions();
  const unavailableCategories = getAvailableCategoryIds();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-on-background">
      {/* 侧边导航 (桌面端) */}
      <aside className="h-screen w-64 left-0 hidden md:flex flex-col bg-surface-container-low p-6 gap-3 fixed z-40">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <UserAvatarMenu user={user} />
            <div className="text-lg font-bold text-primary">我的账本</div>
          </div>
          <div className="text-sm text-on-surface-variant opacity-70">财务管理系统</div>
        </div>

        <nav className="flex flex-col gap-3 flex-grow">
          <Link to="/dashboard" className="text-on-surface-variant hover:bg-surface-variant rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span>首页概览</span>
          </Link>
          <Link to="/transactions" className="text-on-surface-variant hover:bg-surface-variant rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>收支明细</span>
          </Link>
          <Link to="/statistics" className="text-on-surface-variant hover:bg-surface-variant rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">analytics</span>
            <span>统计报表</span>
          </Link>
          <Link to="/budget" className="bg-primary-container text-on-primary-container rounded-full font-semibold flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>预算管理</span>
          </Link>
          <Link to="/settings" className="text-on-surface-variant hover:bg-surface-variant rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span>设置</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-24 md:pb-0">
        {/* 顶部导航栏 */}
        <header className="w-full top-0 sticky shadow-sm bg-surface z-30 flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <UserAvatarMenu user={user} />
              <div className="text-xl font-bold text-primary">我的账本</div>
            </div>
            <div className="hidden md:block text-xl font-semibold text-primary">预算管理</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 pr-6 py-2 bg-surface-container rounded-full text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
          {/* 月度总预算概览 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 总预算卡片 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">本月预算</h3>
                  <p className="text-sm text-on-surface-variant">2026年7月</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">¥<span id="totalBudget">{formatAmount(summary.totalBudget)}</span></div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-on-surface-variant">剩余</span>
                <span id="totalRemaining" className={`font-semibold ${summary.totalRemaining >= 0 ? 'text-success' : 'text-error'}`}>¥{formatAmount(summary.totalRemaining)}</span>
              </div>
            </div>

            {/* 已使用卡片 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-warning">payments</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">已使用</h3>
                  <p className="text-sm text-on-surface-variant">本月支出</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-warning mb-2">¥<span id="totalSpent">{formatAmount(summary.totalSpent)}</span></div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div id="totalProgress" className="h-full bg-warning rounded-full progress-bar" style={{ width: `${Math.min((summary.totalSpent / summary.totalBudget) * 100, 100) || 0}%` }}></div>
              </div>
            </div>

            {/* 超支警告卡片 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">超支统计</h3>
                  <p className="text-sm text-on-surface-variant">超出预算的分类</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-error mb-2"><span id="overBudgetCount">{summary.overBudgetCount}</span> 个</div>
              <div className="text-sm text-on-surface-variant">分类超出设定预算</div>
            </div>
          </div>

          {/* 分类预算列表 */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-on-surface">分类预算</h3>
              <button
                onClick={handleShowAdd}
                className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>添加预算</span>
              </button>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">account_balance_wallet</span>
                </div>
                <h4 className="text-lg font-semibold text-on-surface mb-2">暂无预算记录</h4>
                <p className="text-sm text-on-surface-variant mb-4">设置每月预算，帮助您更好地管理财务</p>
                <button
                  onClick={handleShowAdd}
                  className="bg-primary text-on-primary px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all"
                >
                  添加第一个预算
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map(budget => {
                  const percentage = budget.budgetAmount > 0
                    ? Math.min((budget.spent / budget.budgetAmount) * 100, 100)
                    : 0;
                  return (
                    <div key={budget.id} className="bg-surface-container rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: budget.categoryColor + '20' }}
                        >
                          {budget.categoryIcon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-on-surface">{budget.categoryName}</h4>
                          <p className="text-sm text-on-surface-variant">预算 ¥{formatAmount(budget.budgetAmount)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-all"
                          >
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">edit</span>
                          </button>
                          <button
                            onClick={() => handleShowDelete(budget)}
                            className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center hover:bg-error hover:text-white transition-all"
                          >
                            <span className="material-symbols-outlined text-sm text-error">delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-on-surface-variant">已使用</span>
                          <span className={budget.isOverBudget ? 'text-error' : 'text-on-surface'}>¥{formatAmount(budget.spent)} / ¥{formatAmount(budget.budgetAmount)}</span>
                        </div>
                        <div className="w-full bg-surface-container-lowest rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full progress-bar ${budget.isOverBudget ? 'bg-error' : ''}`}
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: budget.isOverBudget ? '' : budget.categoryColor
                            }}
                          />
                        </div>
                      </div>

                      {budget.isOverBudget && (
                        <div className="bg-error/10 rounded-lg p-2 mb-2">
                          <p className="text-sm text-error font-medium">
                            ⚠️ 已超出预算 ¥{formatAmount(Math.abs(budget.remaining))}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className={budget.remaining >= 0 ? 'text-success' : 'text-error'}>
                          {budget.remaining >= 0 ? '剩余' : '超支'} ¥{formatAmount(Math.abs(budget.remaining))}
                        </span>
                        <span className="text-on-surface-variant">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 预算小贴士 */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-success">lightbulb</span>
              </div>
              <h3 className="text-lg font-semibold text-on-surface">预算小贴士</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container p-4 rounded-xl">
                <p className="text-sm text-on-surface">💡 建议将每月收入的50%用于必要支出</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl">
                <p className="text-sm text-on-surface">💰 为每个支出分类设置合理预算</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl">
                <p className="text-sm text-on-surface">📊 定期检查预算使用情况</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部导航栏 (移动端) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface shadow-lg md:hidden border-t border-outline-variant rounded-t-xl">
        <Link to="/dashboard" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium">首页</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">list_alt</span>
          <span className="text-xs font-medium">明细</span>
        </Link>
        <Link to="/statistics" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">pie_chart</span>
          <span className="text-xs font-medium">统计</span>
        </Link>
        <Link to="/budget" className="flex flex-col items-center bg-primary-container text-on-primary-container rounded-full px-6 py-1">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-xs font-medium">预算</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-medium">设置</span>
        </Link>
      </nav>

      {/* 添加/编辑预算弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-[200] hidden md:block">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl p-6 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center mb-6">{editingBudgetId ? '编辑预算' : '添加预算'}</h3>

            {/* 分类选择 */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">选择分类</p>
              <div className="grid grid-cols-4 gap-2 p-4 bg-surface-container rounded-xl max-h-48 overflow-y-auto">
                {categories.map(cat => {
                  const isUnavailable = unavailableCategories.includes(cat.id);
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => !isUnavailable && setSelectedCategoryId(cat.id)}
                      disabled={isUnavailable}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-primary-container ring-2 ring-primary'
                          : isUnavailable
                          ? 'bg-surface-container opacity-50 cursor-not-allowed'
                          : 'bg-surface-container hover:bg-surface-container-high cursor-pointer'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs text-on-surface">{cat.name}</span>
                      {isUnavailable && <span className="text-[10px] text-error">已有</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 预算金额 */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">预算金额</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary text-lg"
                />
              </div>
            </div>

            {/* 提示信息 */}
            {selectedCategoryId && (
              <div className="mb-6 p-4 bg-primary-container/30 rounded-xl">
                <p className="text-sm text-on-surface-variant">
                  <span className="text-primary font-medium">该分类本月已支出 ¥{formatAmount(getCategorySpent(selectedCategoryId))}</span>
                </p>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-full font-semibold bg-surface-container text-on-surface-variant transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-full font-semibold bg-primary text-on-primary transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] hidden md:block">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-[90vw]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-error text-3xl">delete</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">删除预算</h3>
              <p className="text-sm text-on-surface-variant mb-6">确定要删除"{deleteBudgetName}"的预算吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-full font-semibold bg-surface-container text-on-surface-variant transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-full font-semibold bg-error text-white transition-all"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;
