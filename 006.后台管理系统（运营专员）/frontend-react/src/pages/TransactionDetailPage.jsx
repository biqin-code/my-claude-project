import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransactionDetail } from '../api/transactions';

function TransactionDetailPage() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactionDetail();
  }, [id]);

  const loadTransactionDetail = async () => {
    try {
      setLoading(true);
      const result = await getTransactionDetail(id);
      if (result.code === 200) {
        setTransaction(result.data);
      }
    } catch (error) {
      console.error('加载交易详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">交易记录不存在</p>
        <Link to="/transactions" className="text-primary hover:underline mt-4 inline-block">
          返回交易列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/transactions" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">交易详情</h2>
        </div>
      </div>

      {/* 交易信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">receipt</span>
          交易信息
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">交易ID</p>
            <p className="font-medium text-gray-900">{transaction.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">交易类型</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                transaction.type === 'expense'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {transaction.type === 'expense' ? '支出' : '收入'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">交易金额</p>
            <p className={`text-xl font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
              {transaction.type === 'expense' ? '-' : '+'}¥{Math.abs(transaction.amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">交易分类</p>
            <p className="font-medium text-gray-900">{transaction.category_name || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-1">备注</p>
            <p className="font-medium text-gray-900">{transaction.note || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">支付方式</p>
            <p className="font-medium text-gray-900">{transaction.payment_method || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">交易日期</p>
            <p className="font-medium text-gray-900">{formatDate(transaction.transaction_date)}</p>
          </div>
        </div>
      </div>

      {/* 用户信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          用户信息
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">用户ID</p>
            <p className="font-medium text-gray-900">{transaction.user_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">用户名</p>
            <p className="font-medium text-gray-900">{transaction.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">昵称</p>
            <p className="font-medium text-gray-900">{transaction.nickname || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">邮箱</p>
            <p className="font-medium text-gray-900">{transaction.email || '-'}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            to={`/users/${transaction.user_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-200 to-pink-300 text-white rounded-full hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
            查看用户详情
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailPage;
