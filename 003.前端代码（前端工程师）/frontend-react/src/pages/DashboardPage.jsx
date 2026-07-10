import React, { useState, useEffect } from 'react';
import { logout as logoutApi, getCurrentUser } from '../api/auth';
import { logout } from '../utils/auth';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取用户信息
    async function fetchUser() {
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
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      logout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="w-full top-0 sticky z-30 shadow-sm bg-surface flex justify-between items-center px-5 h-16">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-lg">🍀</div>
            <div className="text-xl font-bold text-primary">我的账本</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </div>
            <span className="text-sm font-medium text-on-surface">{user?.username || '用户'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            退出
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="p-6 max-w-4xl mx-auto">
        {/* 欢迎卡片 */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-3xl">
              🍀
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                欢迎回来，{user?.nickname || user?.username || '用户'}！
              </h1>
              <p className="text-on-surface-variant">您的财务管理专家</p>
            </div>
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-catering/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-catering text-2xl">add</span>
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">记一笔</h3>
            <p className="text-sm text-on-surface-variant">快速记录您的收支</p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-transport/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-transport text-2xl">list_alt</span>
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">收支明细</h3>
            <p className="text-sm text-on-surface-variant">查看所有交易记录</p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-shopping/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-shopping text-2xl">analytics</span>
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">统计报表</h3>
            <p className="text-sm text-on-surface-variant">了解您的消费分布</p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-entertainment/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-entertainment text-2xl">settings</span>
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">设置</h3>
            <p className="text-sm text-on-surface-variant">管理您的账户设置</p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-outline">
          <p>财务管理App - React + MySQL 演示</p>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
