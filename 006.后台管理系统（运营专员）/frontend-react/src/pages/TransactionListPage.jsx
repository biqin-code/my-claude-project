import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactionList, getCategories } from '../api/transactions';

function TransactionListPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, [page, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      if (result.code === 200) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await getTransactionList({
        page,
        pageSize,
        keyword,
        type,
        categoryId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });
      if (result.code === 200) {
        setTransactions(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载交易列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const handleReset = () => {
    setKeyword('');
    setType('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
    setSortBy('transaction_date');
    setSortOrder('DESC');
    setPage(1);
    loadTransactions();
  };

  const handleExport = () => {
    const csvContent = [
      ['交易ID', '用户名', '类型', '金额', '分类', '备注', '支付方式', '交易日期'].join(','),
      ...transactions.map(t => [
        t.id,
        t.username,
        t.type === 'expense' ? '支出' : '收入',
        t.amount,
        t.category_name || '',
        (t.note || '').replace(/,/g, ' '),
        t.payment_method || '',
        t.transaction_date
      ].join(','))
    ].join('\n');

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
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
      <h2 className="text-2xl font-bold text-gray-800">交易管理 - 交易记录</h2>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">关键词搜索</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="备注关键词"
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              >
                <option value="">全部</option>
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">分类</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              >
                <option value="">全部</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-pink-200 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">结束日期</label>
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
                <option value="transaction_date">交易日期</option>
                <option value="amount">金额</option>
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

      {/* 交易列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支付方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">暂无数据</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          tx.type === 'expense'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {tx.type === 'expense' ? '支出' : '收入'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'expense' ? '-' : '+'}¥{Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{tx.note || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.payment_method || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tx.transaction_date)}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/transactions/${tx.id}`}
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

export default TransactionListPage;
