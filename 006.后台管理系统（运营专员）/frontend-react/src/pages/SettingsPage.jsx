import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, logout } from '../api/auth';
import { getAdminInfo } from '../utils/auth';

function SettingsPage() {
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新密码与确认密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码长度至少为6位');
      return;
    }

    try {
      setLoading(true);
      const result = await changePassword(oldPassword, newPassword);
      if (result.code === 200) {
        setSuccess('密码修改成功');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message || '密码修改失败');
      }
    } catch (err) {
      setError(err.message || '密码修改失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <h2 className="text-2xl font-bold text-gray-800">系统设置</h2>

      {/* 管理员信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          管理员信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">用户名</p>
            <p className="font-medium text-gray-900">{adminInfo?.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">昵称</p>
            <p className="font-medium text-gray-900">{adminInfo?.nickname || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">角色</p>
            <p className="font-medium text-gray-900">
              {adminInfo?.role === 'super_admin' ? '超级管理员' : '管理员'}
            </p>
          </div>
        </div>
      </div>

      {/* 修改密码 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">lock</span>
          修改密码
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 py-2 px-4 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 py-2 px-4 rounded-xl">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-pink-200 to-pink-300 text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            保存修改
          </button>
        </form>
      </div>

      {/* 退出登录 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">logout</span>
          安全退出
        </h3>
        <p className="text-gray-500 mb-4">退出后需要重新登录才能访问后台管理系统。</p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full shadow-lg hover:brightness-105 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          退出登录
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
