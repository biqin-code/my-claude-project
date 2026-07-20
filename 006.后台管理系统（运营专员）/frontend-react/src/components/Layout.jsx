import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import { getAdminInfo } from '../utils/auth';

function Layout() {
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: '首页仪表盘' },
    { path: '/users', icon: 'group', label: '用户管理' },
    { path: '/transactions', icon: 'receipt_long', label: '交易管理' },
    { path: '/statistics', icon: 'bar_chart', label: '统计分析' },
    { path: '/settings', icon: 'settings', label: '系统设置' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex">
      {/* 侧边栏 */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-pink-200 to-pink-300 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              🍀
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-white">财务后台</span>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 transition-all ${
                  isActive
                    ? 'bg-white/20 border-r-4 border-white'
                    : 'hover:bg-white/10'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {sidebarOpen && <span className="text-sm text-white">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/10 transition-all text-white"
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? 'chevron_left' : 'chevron_right'}
            </span>
            {sidebarOpen && <span className="text-sm">收起</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <span className="material-symbols-outlined text-gray-600">menu</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">后台管理系统</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* 管理员信息 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-primary font-semibold">
                {adminInfo?.nickname?.charAt(0) || adminInfo?.username?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {adminInfo?.nickname || adminInfo?.username}
                </p>
                <p className="text-xs text-gray-500">{adminInfo?.role === 'super_admin' ? '超级管理员' : '管理员'}</p>
              </div>
            </div>

            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden md:inline">退出登录</span>
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
