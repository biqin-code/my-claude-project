import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      if (result.code === 200 && result.data) {
        localStorage.setItem('admin_token', result.data.token);
        localStorage.setItem('admin_info', JSON.stringify(result.data.admin));
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
      <div className="w-full max-w-md">
        {/* 品牌标识 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4 rounded-full bg-pink-100 flex items-center justify-center text-5xl shadow-lg">
            🍀
          </div>
          <h1 className="text-2xl font-bold text-primary">财务管理后台</h1>
          <p className="text-sm text-gray-500 mt-2">管理系统登录</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 用户名 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 ml-3">用户名</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-transparent rounded-full text-base focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
                  placeholder="请输入用户名"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
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
                  placeholder="请输入密码"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                className="w-full bg-gradient-to-r from-pink-200 to-pink-300 hover:opacity-90 active:scale-95 text-lg font-semibold py-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50"
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
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-6 text-xs text-gray-400">
          © 2026 财务管理App - 后台管理系统
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
