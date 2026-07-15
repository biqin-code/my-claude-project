/**
 * 预算管理API服务
 */

const API_BASE = 'http://localhost:3000/api';

async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('finance_token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...defaultOptions,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

/**
 * 获取指定月份的预算列表
 */
export async function getBudgets(month) {
  return request(`/budgets?month=${month}`);
}

/**
 * 获取可设置预算的分类
 */
export async function getBudgetCategories() {
  return request('/budgets/categories');
}

/**
 * 获取指定月份各类别支出
 */
export async function getCategorySpending(month) {
  return request(`/budgets/category-spending?month=${month}`);
}

/**
 * 添加或更新预算
 */
export async function saveBudget(categoryId, budgetAmount, budgetMonth) {
  return request('/budgets', {
    method: 'POST',
    body: JSON.stringify({ categoryId, budgetAmount, budgetMonth }),
  });
}

/**
 * 删除预算
 */
export async function deleteBudget(id) {
  return request(`/budgets/${id}`, {
    method: 'DELETE',
  });
}
