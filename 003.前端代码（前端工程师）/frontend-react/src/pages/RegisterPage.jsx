import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { isLoggedIn } from '../utils/auth';

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    // 前端验证
    if (!/^[a-zA-Z0-9]{4,20}$/.test(username)) {
      setError('用户名需为4-20位字母或数字');
      return;
    }

    if (password.length < 6) {
      setError('密码需6位以上');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, password);
      if (result.code === 200) {
        alert('注册成功，请登录！');
        navigate('/login');
      } else {
        setError(result.message || '注册失败');
      }
    } catch (err) {
      setError(err.message || '注册失败，请稍后重试');
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
            <p className="text-sm text-secondary">创建您的账户</p>
          </div>

          {/* 注册表单 */}
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
                  placeholder="4-20位字母或数字"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant" htmlFor="password">密码</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-outline-variant"
                  id="password"
                  name="password"
                  placeholder="6位以上"
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

            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant" htmlFor="confirmPassword">确认密码</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-outline-variant"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="再次输入密码"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
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
                  注册
                  <span className="material-symbols-outlined">how_to_reg</span>
                </>
              )}
            </button>
          </form>

          {/* 登录入口 */}
          <div className="mt-8 w-full">
            <div className="text-center">
              <p className="text-sm text-on-surface-variant">
                已有账号？
                <Link className="text-primary font-semibold hover:underline" to="/login">
                  立即登录
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

export default RegisterPage;
