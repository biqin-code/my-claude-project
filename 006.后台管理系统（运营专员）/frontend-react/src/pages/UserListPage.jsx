import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserList } from '../api/users';

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    loadUsers();
  }, [page, sortBy, sortOrder]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getUserList({
        page,
        pageSize,
        keyword,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });
      if (result.code === 200) {
        setUsers(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
    loadUsers();
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', '用户名', '昵称', '邮箱', '注册时间', '最近登录', '交易笔数'].join(','),
      ...users.map(u => [
        u.id,
        u.username,
        u.nickname || '',
        u.email || '',
        u.created_at,
        u.last_login || '',
        u.transaction_count
      ].join(','))
    ].join('\n');

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <h2 className="text-2xl font-bold text-gray-800">用户管理 - 用户列表</h2>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">关键词搜索</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="用户名/昵称/邮箱"
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">注册开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">注册结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">排序字段</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              >
                <option value="created_at">注册时间</option>
                <option value="transaction_count">交易笔数</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">排序方向</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              >
                <option value="DESC">降序</option>
                <option value="ASC">升序</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-pink-200 to-pink-300 text-white rounded-full hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              搜索
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all"
            >
              重置
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-6 py-2 bg-green-500 text-white rounded-full hover:brightness-105 transition-all flex items-center gap-2 ml-auto"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              导出CSV
            </button>
          </div>
        </form>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">昵称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">交易笔数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">暂无数据</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.nickname || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.transaction_count}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/users/${user.id}`}
                        className="text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                        查看
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm text-gray-600">
              共 {total} 条记录，第 {page} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-50 transition-all"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-50 transition-all"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserListPage;
