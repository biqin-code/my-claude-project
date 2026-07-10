import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { isLoggedIn } from '../utils/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 如果已登录，跳转到首页
  React.useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.code === 200) {
        navigate('/dashboard');
      } else {
        setError(result.message || '登录失败');
      }
    } catch (err) {
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative bg-background">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-success/10 rounded-full blur-3xl"></div>
      </div>

      <main className="w-full max-w-md z-10">
        <div className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center shadow-lg">
          {/* Logo和标题 */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-5xl">🍀</div>
            <h1 className="text-2xl font-bold text-primary">我的账本</h1>
            <p className="text-sm text-secondary">开启您的财务极简之旅</p>
          </div>

          {/* 登录表单 */}
          <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 text-error text-sm p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant" htmlFor="username">用户名</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-outline-variant"
                  id="username"
                  name="username"
                  placeholder="请输入您的用户名"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-on-surface-variant" htmlFor="password">密码</label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-outline-variant"
                  id="password"
                  name="password"
                  placeholder="请输入您的登录密码"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              className="mt-2 w-full text-lg font-semibold py-4 rounded-xl shadow-sm hover:brightness-105 active:scale-[0.98] transition-all flex justify-center items-center gap-2 bg-primary text-on-primary disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  登录
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          {/* 注册入口 */}
          <div className="mt-8 w-full">
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 text-xs text-outline-variant">快捷方式</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-all active:scale-90">
                <span className="material-symbols-outlined text-secondary">fingerprint</span>
              </button>
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-all active:scale-90">
                <span className="material-symbols-outlined text-secondary">face</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-on-surface-variant">
                没有账号？
                <Link className="text-primary font-semibold hover:underline" to="/register">
                  立即注册
                </Link>
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-6 text-center">
          <p className="text-xs text-outline">© 2024 我的账本 - 智能财务管理专家</p>
        </footer>
      </main>
    </div>
  );
}

export default LoginPage;
