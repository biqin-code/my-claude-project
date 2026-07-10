/**
 * 认证工具函数
 */

const TOKEN_KEY = 'finance_token';
const USER_KEY = 'finance_user';

/**
 * 获取存储的Token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 保存Token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 移除Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * 获取用户信息
 */
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * 保存用户信息
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;

  // TODO: 可以验证token过期时间
  return true;
}

/**
 * 退出登录
 */
export function logout() {
  removeToken();
  window.location.href = '/login';
}
