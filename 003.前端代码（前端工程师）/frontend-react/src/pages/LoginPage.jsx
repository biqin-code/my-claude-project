import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-6 md:p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* 左侧插图 */}
        <div className="hidden lg:flex items-center justify-center p-8">
          <div className="w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-8xl">
              💰
            </div>
          </div>
        </div>

        {/* 登录表单 */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
          <div className="w-full bg-white rounded-2xl p-8 shadow-lg">

            {/* 品牌标识 */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 mb-4 rounded-full bg-pink-100 flex items-center justify-center text-6xl">🍀</div>
              <h1 className="text-2xl font-bold text-primary">我的账本</h1>
              <p className="text-sm text-gray-500 mt-2">开启您的财务极简之旅</p>
            </div>

            {/* 表单 */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* 用户名 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 ml-3">用户名</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-transparent rounded-full text-base focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
                    id="username"
                    name="username"
                    placeholder="请输入用户名"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 ml-3">密码</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-transparent rounded-full text-base focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
                    id="password"
                    name="password"
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              {/* 登录按钮 */}
              <div className="pt-4">
                <button
                  className="w-full bg-primary hover:brightness-105 active:scale-95 text-lg font-semibold py-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>登录</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 服务条款 */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                登录即代表您同意 <a className="text-primary hover:underline font-medium" href="#">服务条款</a> 和 <a className="text-primary hover:underline font-medium" href="#">隐私政策</a>
              </p>
            </div>
          </div>

          {/* 注册入口 */}
          <div className="mt-6 text-center">
            <p className="text-base text-gray-500">
              没有账号？ <Link className="text-primary font-semibold hover:underline" to="/register">立即注册</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
