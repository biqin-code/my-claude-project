import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatarMenu from '../components/UserAvatarMenu';
import { getCurrentUser } from '../api/auth';

const API_BASE = '/api';

// API请求
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('finance_token');
  const defaultOptions = { headers: { 'Content-Type': 'application/json' } };
  if (token) defaultOptions.headers['Authorization'] = `Bearer ${token}`;
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

// 格式化金额
function formatAmount(amount) {
  return Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function StatisticsPage() {
  const [user, setUser] = useState(null);
  const [monthly, setMonthly] = useState({ monthTotal: 0, dailyAverage: 0, recordDays: 0, lastMonthTotal: 0, monthChange: 0, monthChangeType: 'same' });
  const [categories, setCategories] = useState([]);
  const [yearlyTrend, setYearlyTrend] = useState([]);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userResult, monthlyRes, categoryRes, yearlyRes] = await Promise.all([
          getCurrentUser(),
          apiRequest(`${API_BASE}/statistics/monthly`),
          apiRequest(`${API_BASE}/statistics/category-distribution`),
          apiRequest(`${API_BASE}/statistics/yearly-trend`)
        ]);

        if (userResult.code === 200) setUser(userResult.data);
        if (monthlyRes.code === 200) setMonthly(monthlyRes.data);
        if (categoryRes.code === 200) setCategories(categoryRes.data.categories || []);
        if (yearlyRes.code === 200) setYearlyTrend(yearlyRes.data || []);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 环形图的周长计算 (2 * PI * 15.915 ≈ 100)
  const circumference = 2 * Math.PI * 15.915;
  let currentOffset = 0;

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
          <Link to="/transactions" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>收支明细</span>
          </Link>
          <Link to="/statistics" className="bg-primary-container text-on-primary-container rounded-full font-semibold flex items-center gap-4 px-4 py-3 transition-all">
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
      </aside>

      {/* 主内容 */}
      <main className="flex-grow md:ml-64 flex flex-col min-h-screen pb-24 md:pb-0">
        <header className="w-full top-0 sticky z-30 shadow-sm bg-surface flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <UserAvatarMenu user={user} />
              <div className="text-xl font-bold text-primary">我的账本</div>
            </div>
            <div className="hidden md:block text-xl font-semibold text-primary">统计报表</div>
          </div>
        </header>

        <div className="px-6 py-8 max-w-6xl mx-auto w-full pb-32 md:pb-0">
          <div className="grid grid-cols-12 gap-6">
            {/* 月度概览卡片 */}
            <div className="col-span-full lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <span className="text-[120px] text-primary">account_balance_wallet</span>
              </div>
              <h3 className="text-xl font-semibold mb-6">月度概览</h3>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div>
                  <p className="text-xs text-secondary uppercase tracking-widest mb-2">本月总支出</p>
                  <p className="text-4xl font-bold text-primary">¥{formatAmount(monthly.monthTotal)}</p>
                </div>
                <div className="hidden md:block w-px h-16 bg-outline-variant"></div>
                <div>
                  <p className="text-xs text-secondary uppercase tracking-widest mb-2">日均支出</p>
                  <p className="text-2xl font-semibold text-secondary">¥{formatAmount(monthly.dailyAverage)}</p>
                </div>
                <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full ${monthly.monthChangeType === 'down' ? 'bg-success/10 text-success' : monthly.monthChangeType === 'up' ? 'bg-error/10 text-error' : 'bg-surface-container text-secondary'}`}>
                  <span className="material-symbols-outlined text-sm font-bold">{monthly.monthChangeType === 'down' ? 'trending_down' : monthly.monthChangeType === 'up' ? 'trending_up' : 'trending_flat'}</span>
                  <span className="text-xs font-medium">较上月{monthly.monthChangeType === 'down' ? '下降' : monthly.monthChangeType === 'up' ? '超出' : '持平'} {monthly.monthChange}%</span>
                </div>
              </div>
            </div>

            {/* 分类分布卡片 */}
            <div className="col-span-full lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">分类分布</h3>
                <span className="material-symbols-outlined text-secondary cursor-help">info</span>
              </div>
              <div className="flex flex-col items-center">
                {/* 环形图 */}
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f1f5f9" strokeWidth="4"></circle>
                    {categories.length > 0 ? (
                      categories.map((cat, index) => {
                        const dashArray = `${cat.percentage} ${100 - cat.percentage}`;
                        const dashOffset = -currentOffset;
                        currentOffset += cat.percentage;
                        return (
                          <circle
                            key={cat.id}
                            cx="18"
                            cy="18"
                            fill="transparent"
                            r="15.915"
                            stroke={cat.color}
                            strokeWidth="4"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                          />
                        );
                      })
                    ) : (
                      <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#e2e8f0" strokeWidth="4"></circle>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-secondary">总计</span>
                    <span className="text-xl font-semibold text-primary">{categories.reduce((sum, c) => sum + c.percentage, 0)}%</span>
                  </div>
                </div>
                {/* 图例 */}
                <div className="w-full space-y-3">
                  {categories.slice(0, 4).map(cat => (
                    <div key={cat.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{cat.percentage}%</span>
                    </div>
                  ))}
                  {categories.length === 0 && <div className="text-center text-on-surface-variant py-4">暂无数据</div>}
                </div>
              </div>
            </div>

            {/* 12个月趋势卡片 */}
            <div className="col-span-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">12个月趋势</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-xs text-secondary">支出</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-secondary">收入</span>
                  </div>
                </div>
              </div>
              {/* 波浪图 SVG */}
              {yearlyTrend.length > 0 ? (
                <div className="relative h-64">
                  <svg className="w-full h-full" viewBox={`0 0 ${yearlyTrend.length * 80} 200`} preserveAspectRatio="none">
                    {/* 生成平滑曲线路径 */}
                    {(() => {
                      // 计算支出曲线路径
                      const expensePoints = yearlyTrend.map((item, i) => ({
                        x: i * 80 + 40,
                        y: 200 - (item.expenseHeight * 1.6)
                      }));
                      const expensePath = expensePoints.map((p, i) => {
                        if (i === 0) return `M ${p.x} ${p.y}`;
                        const prev = expensePoints[i - 1];
                        const cpX = (prev.x + p.x) / 2;
                        return `Q ${cpX} ${prev.y} ${p.x} ${p.y}`;
                      }).join(' ');

                      // 计算收入曲线路径
                      const incomePoints = yearlyTrend.map((item, i) => ({
                        x: i * 80 + 40,
                        y: 200 - (item.incomeHeight * 1.6)
                      }));
                      const incomePath = incomePoints.map((p, i) => {
                        if (i === 0) return `M ${p.x} ${p.y}`;
                        const prev = incomePoints[i - 1];
                        const cpX = (prev.x + p.x) / 2;
                        return `Q ${cpX} ${prev.y} ${p.x} ${p.y}`;
                      }).join(' ');

                      return (
                        <>
                          {/* 支出渐变填充 */}
                          <defs>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
                            </linearGradient>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>

                          {/* 支出面积填充 */}
                          <path
                            d={`${expensePath} L ${expensePoints[expensePoints.length - 1].x} 200 L ${expensePoints[0].x} 200 Z`}
                            fill="url(#expenseGradient)"
                          />
                          {/* 收入面积填充 */}
                          <path
                            d={`${incomePath} L ${incomePoints[incomePoints.length - 1].x} 200 L ${incomePoints[0].x} 200 Z`}
                            fill="url(#incomeGradient)"
                          />
                          {/* 支出曲线 */}
                          <path
                            d={expensePath}
                            stroke="#ec4899"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                          />
                          {/* 收入曲线 */}
                          <path
                            d={incomePath}
                            stroke="#10b981"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </>
                      );
                    })()}

                    {/* 数据点和悬停区域 */}
                    {yearlyTrend.map((item, index) => {
                      const x = index * 80 + 40;
                      const expenseY = 200 - (item.expenseHeight * 1.6);
                      const incomeY = 200 - (item.incomeHeight * 1.6);
                      return (
                        <g key={index}>
                          {/* 悬停热区 */}
                          <rect
                            x={index * 80}
                            y="0"
                            width="80"
                            height="200"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredMonth(item)}
                            onMouseLeave={() => setHoveredMonth(null)}
                          />
                          {/* 支出点 */}
                          <circle cx={x} cy={expenseY} r="5" fill="#ec4899" />
                          {/* 收入点 */}
                          <circle cx={x} cy={incomeY} r="5" fill="#10b981" />
                        </g>
                      );
                    })}
                  </svg>
                  {/* 悬停提示框 - 鼠标悬停时显示 */}
                  {hoveredMonth && (
                    <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-3 text-sm border border-outline-variant/30">
                      <div className="text-xs text-secondary mb-2">{hoveredMonth.monthName}数据</div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span>支出: ¥{formatAmount(hoveredMonth.expense)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>收入: ¥{formatAmount(hoveredMonth.income)}</span>
                      </div>
                    </div>
                  )}
                  {/* 月份标签 */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
                    {yearlyTrend.map((item) => (
                      <span key={item.month} className="text-xs text-secondary">{item.monthName}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-secondary">暂无数据</div>
              )}
            </div>

            {/* 洞察卡片 */}
            <div className="col-span-full md:col-span-6 bg-surface-container-highest/30 rounded-2xl p-6 border border-outline-variant/30 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-warning">lightbulb</span>
              </div>
              <div>
                <p className="font-medium text-on-surface">省钱建议</p>
                <p className="text-sm text-secondary">
                  {categories.length > 0 && categories[0].percentage > 30
                    ? `本月${categories[0].name}支出占比较高，尝试减少相关支出。`
                    : '继续保持良好的消费习惯，注意控制不必要支出。'}
                </p>
              </div>
            </div>

            <div className="col-span-full md:col-span-6 bg-surface-container-highest/30 rounded-2xl p-6 border border-outline-variant/30 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-success">savings</span>
              </div>
              <div>
                <p className="font-medium text-on-surface">财务健康度</p>
                <p className="text-sm text-secondary">
                  {monthly.monthChangeType === 'down'
                    ? '本月支出相比上月有所下降，继续保持！'
                    : monthly.monthChangeType === 'up'
                    ? '本月支出相比上月有所增加，请注意控制。'
                    : '本月支出与上月基本持平。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部导航 (移动端) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 border-t border-outline-variant md:hidden bg-surface shadow-lg rounded-t-xl">
        <Link to="/dashboard" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium">首页</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">list_alt</span>
          <span className="text-xs font-medium">明细</span>
        </Link>
        <Link to="/statistics" className="flex flex-col items-center bg-primary-container text-on-primary-container rounded-full px-6 py-1">
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
    </div>
  );
}

export default StatisticsPage;
