/**
 * 认证API服务
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * 通用请求封装
 */
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
 * 用户注册
 */
export async function register(username, password) {
  const data = await request('/users/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return data;
}

/**
 * 用户登录
 */
export async function login(username, password) {
  const data = await request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // 登录成功后保存token和用户信息
  if (data.code === 200 && data.data) {
    localStorage.setItem('finance_token', data.data.token);
    localStorage.setItem('finance_user', JSON.stringify({
      id: data.data.userId,
      username: data.data.username,
    }));
  }

  return data;
}

/**
 * 用户登出
 */
export async function logout() {
  const token = localStorage.getItem('finance_token');
  if (!token) return;

  try {
    await request('/users/logout', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('登出请求失败:', error);
  } finally {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  const data = await request('/users/me');
  return data;
}
