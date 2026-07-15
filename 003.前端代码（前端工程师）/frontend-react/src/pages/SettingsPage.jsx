import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { logout } from '../utils/auth';

const API_BASE = 'http://localhost:3000/api';

// API请求
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('finance_token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...defaultOptions, ...options });

  // 先检查状态码
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || '请求失败');
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data;
}

// 头像列表
const avatarList = ['👤', '👧', '👨', '👩', '🧑', '👴', '👵', '🧔', '👱', '🤵', '👰', '🎅', '🦸', '🧙', '🧚', '🧛', '🧜', '🧝', '🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🦄', '🐷', '🐮', '🐻'];

// Emoji列表
const emojiList = ['🍜', '🚗', '🛒', '🎬', '🏠', '💊', '📚', '📦', '💰', '🎁', '📈', '🎀', '🍕', '☕', '🎮', '🎵', '✈️', '🏋️', '👗', '💄', '🏠', '💻', '📱', '🎯', '⚽', '🎨', '🌸', '🌟', '🔥', '❤️', '🌈', '🍀', '🌙', '☀️', '🌺', '🎡', '🏖️', '🎢', '🛶', '🚁', '🚂', '🚀', '🛸', '⛵', '🏄', '🏊', '🤽', '🚴', '🚣', '🧗', '⛷️', '🏂', '🛷', '☃️', '⛳', '🎣', '🎽', '🎿', '🛷', '🥊', '🏋️', '🤸', '🤺', '⛹️', '🧘', '🏌️'];

// 颜色列表
const colorList = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 分类数据
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  // 用户信息弹窗状态
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [selectedAvatarEmoji, setSelectedAvatarEmoji] = useState('👤');
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  // 密码弹窗状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 分类弹窗状态
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryType, setCategoryType] = useState('expense');
  const [categoryName, setCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍜');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const avatarInputRef = useRef(null);

  // 打开用户信息弹窗时初始化状态
  const openUserModal = () => {
    const userAvatar = user?.avatarUrl || '👤';
    if (userAvatar.startsWith('data:')) {
      setIsCustomAvatar(true);
      setAvatarDataUrl(userAvatar);
      setSelectedAvatarEmoji('👤');
    } else {
      setIsCustomAvatar(false);
      setAvatarDataUrl(null);
      setSelectedAvatarEmoji(userAvatar);
    }
    setEditUsername(user?.username || '');
    setEditEmail(user?.email || '');
    setEditNickname(user?.nickname || '');
    setShowUserModal(true);
  };

  // 加载用户信息
  useEffect(() => {
    loadUserInfo();
    loadCategories();
  }, []);

  async function loadUserInfo() {
    try {
      const data = await apiRequest(`${API_BASE}/users/me`);
      if (data.code === 200) {
        setUser(data.data);
        setEditUsername(data.data.username || '');
        setEditEmail(data.data.email || '');
        setEditNickname(data.data.nickname || '');
        setSelectedAvatar(data.data.avatarUrl || '👤');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await apiRequest(`${API_BASE}/categories`);
      if (data.code === 200) {
        const allCategories = data.data;
        setExpenseCategories(allCategories.filter(c => c.type === 'expense'));
        setIncomeCategories(allCategories.filter(c => c.type === 'income'));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  }

  // 保存用户信息
  async function handleSaveUserInfo() {
    if (!editUsername.trim()) {
      alert('用户名不能为空');
      return;
    }

    if (!/^[a-zA-Z0-9]{4,20}$/.test(editUsername)) {
      alert('用户名需为4-20位字母或数字');
      return;
    }

    setUserLoading(true);
    try {
      const updateData = {
        username: editUsername.trim(),
        email: editEmail.trim() || null,
        nickname: editNickname.trim() || null,
        avatarUrl: isCustomAvatar ? avatarDataUrl : selectedAvatarEmoji
      };

      console.log('Sending update data, avatar length:', updateData.avatarUrl?.length || 0);

      const data = await apiRequest(`${API_BASE}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (data.code === 200) {
        setUser(data.data);
        localStorage.setItem('finance_user', JSON.stringify({
          id: data.data.id,
          username: data.data.username
        }));
        setShowUserModal(false);
        alert('资料更新成功');
      } else {
        alert(data.message || '更新失败');
      }
    } catch (error) {
      console.error('Save user info error:', error);
      alert(error.message || '更新失败，请稍后重试');
    } finally {
      setUserLoading(false);
    }
  }

  // 修改密码
  async function handleChangePassword() {
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('新密码两次输入不一致');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('新密码长度不能少于6位');
      return;
    }

    setPasswordLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/users/password`, {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (data.code === 200) {
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('密码修改成功');
      } else {
        setPasswordError(data.message || '修改失败');
      }
    } catch (error) {
      setPasswordError(error.message || '修改失败，请稍后重试');
    } finally {
      setPasswordLoading(false);
    }
  }

  // 添加分类
  async function handleAddCategory() {
    if (!categoryName.trim()) {
      alert('请输入分类名称');
      return;
    }

    setCategoryLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/categories`, {
        method: 'POST',
        body: JSON.stringify({
          type: categoryType,
          name: categoryName.trim(),
          icon: selectedEmoji,
          color: selectedColor
        })
      });

      if (data.code === 200) {
        loadCategories();
        setShowCategoryModal(false);
        setCategoryName('');
        setSelectedEmoji('🍜');
        setSelectedColor('#FF6B6B');
        alert('分类添加成功');
      } else {
        alert(data.message || '添加失败');
      }
    } catch (error) {
      alert(error.message || '添加失败，请稍后重试');
    } finally {
      setCategoryLoading(false);
    }
  }

  // 删除分类
  async function handleDeleteCategory() {
    if (!categoryToDelete) return;

    setCategoryLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });

      if (data.code === 200) {
        loadCategories();
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        alert('分类删除成功');
      } else {
        alert(data.message || '删除失败');
      }
    } catch (error) {
      alert(error.message || '删除失败，请稍后重试');
    } finally {
      setCategoryLoading(false);
    }
  }

  // 处理头像上传 - 压缩大图片
  function handleAvatarUpload(event) {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      input.value = '';
      return;
    }

    // 创建图片用于压缩
    const img = new Image();
    img.onload = () => {
      // 计算压缩后的尺寸（最大200x200）
      const maxSize = 200;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      // 创建Canvas进行压缩
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 压缩为JPEG格式，质量0.5（降低质量以确保数据较小）
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);

      setAvatarDataUrl(compressedDataUrl);
      setIsCustomAvatar(true);

      // 延迟重置input
      setTimeout(() => {
        input.value = '';
      }, 0);
    };
    img.onerror = () => {
      alert('图片加载失败');
      input.value = '';
    };

    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      alert('文件读取失败');
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  // 登出
  function handleLogout() {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* 侧边导航 */}
      <aside className="h-screen w-64 left-0 hidden md:flex flex-col bg-surface-container-low p-6 gap-3 fixed z-40">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-2xl">🍀</div>
            <div className="text-lg font-bold text-primary">我的账本</div>
          </div>
          <div className="text-sm text-on-surface-variant opacity-70">财务管理系统</div>
        </div>

        <nav className="flex flex-col gap-3 flex-grow">
          <Link to="/dashboard" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span>首页概览</span>
          </Link>
          <Link to="/transactions" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>收支明细</span>
          </Link>
          <Link to="/statistics" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">analytics</span>
            <span>统计报表</span>
          </Link>
          <Link to="/budget" className="text-on-surface-variant hover:bg-surface-container-low rounded-full flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>预算管理</span>
          </Link>
          <Link to="/settings" className="bg-primary-container text-on-primary-container rounded-full font-semibold flex items-center gap-4 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span>设置</span>
          </Link>
        </nav>

        {/* 移除"记一笔"按钮 */}
      </aside>

      {/* 主内容 */}
      <main className="flex-grow md:ml-64 flex flex-col min-h-screen pb-24 md:pb-0">
        <header className="w-full top-0 sticky z-30 shadow-sm bg-surface flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-lg">🍀</div>
              <div className="text-xl font-bold text-primary">我的账本</div>
            </div>
            <div className="hidden md:block text-xl font-semibold text-primary">设置</div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-container-low transition-all text-on-surface-variant">
            <span className="material-symbols-outlined">logout</span>
            <span className="hidden md:inline">退出</span>
          </button>
        </header>

        <div className="px-6 py-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 账户管理 */}
            <section className="lg:col-span-12">
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container">account_circle</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-on-surface">账户管理</h3>
                    <p className="text-sm text-on-surface-variant">管理您的账户信息和安全设置</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 用户信息 */}
                  <div onClick={openUserModal} className="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-3xl overflow-hidden">
                      {user?.avatarUrl && user.avatarUrl.startsWith('data:') ? (
                        <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                      ) : (
                        <span>{user?.avatarUrl || '👤'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-on-surface">{user?.nickname || user?.username}</h4>
                      <p className="text-sm text-on-surface-variant">{user?.email || '未设置邮箱'}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </div>

                  {/* 修改密码 */}
                  <div onClick={() => setShowPasswordModal(true)} className="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary">key</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-on-surface">修改登录密码</h4>
                      <p className="text-sm text-on-surface-variant">上次修改于 30 天前</p>
                    </div>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 分类管理 */}
            <section className="lg:col-span-12">
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-tertiary-container">category</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-on-surface">分类管理</h3>
                      <p className="text-sm text-on-surface-variant">管理您的支出和收入分类</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCategoryModal(true);
                      setCategoryName('');
                      setSelectedEmoji('🍜');
                      setSelectedColor('#FF6B6B');
                    }}
                    className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>添加分类</span>
                  </button>
                </div>

                {/* 支出分类 */}
                <div className="mb-8">
                  <h4 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-catering"></span>
                    支出分类
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {expenseCategories.map(cat => (
                      <div key={cat.id} className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all relative group">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-medium text-on-surface">{cat.name}</span>
                        {!cat.isSystem && (
                          <button
                            onClick={() => { setCategoryToDelete(cat); setShowDeleteModal(true); }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error/10 text-error opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-error hover:text-white"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 收入分类 */}
                <div>
                  <h4 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    收入分类
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {incomeCategories.map(cat => (
                      <div key={cat.id} className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all relative group">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-medium text-on-surface">{cat.name}</span>
                        {!cat.isSystem && (
                          <button
                            onClick={() => { setCategoryToDelete(cat); setShowDeleteModal(true); }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error/10 text-error opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-error hover:text-white"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 底部导航 (移动端) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface shadow-lg md:hidden border-t border-outline-variant rounded-t-xl">
        <Link to="/dashboard" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium">首页</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">list_alt</span>
          <span className="text-xs font-medium">明细</span>
        </Link>
        <Link to="/statistics" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">pie_chart</span>
          <span className="text-xs font-medium">统计</span>
        </Link>
        <Link to="/budget" className="flex flex-col items-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-xs font-medium">预算</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center bg-primary-container text-on-primary-container rounded-full px-6 py-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="text-xs font-medium">设置</span>
        </Link>
      </nav>

      {/* 用户信息编辑弹窗 */}
      {showUserModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setShowUserModal(false)}></div>
          <div className="relative bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-center mb-6">编辑用户信息</h3>

            {/* 头像选择 */}
            <div className="mb-6">
              <p className="text-sm text-on-surface-variant mb-3 text-center">选择头像</p>
              <div className="grid grid-cols-8 gap-2 p-4 bg-white rounded-xl max-h-48 overflow-y-auto">
                {avatarList.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => { setSelectedAvatarEmoji(avatar); setIsCustomAvatar(false); setAvatarDataUrl(null); }}
                    className={`w-10 h-10 rounded-full hover:bg-surface-container-high transition-all flex items-center justify-center text-xl ${selectedAvatarEmoji === avatar && !isCustomAvatar ? 'bg-primary-container ring-2 ring-primary' : ''}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 justify-center">
                <span className="text-sm text-on-surface-variant">已选:</span>
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-5xl overflow-hidden border-2 border-primary">
                  {isCustomAvatar && avatarDataUrl ? (
                    <img src={avatarDataUrl} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <span>{selectedAvatarEmoji}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90 transition-all"
                >
                  上传图片
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* 用户名 */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">用户名</p>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                maxLength={20}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 昵称 */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">昵称</p>
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                maxLength={50}
                placeholder="请输入昵称（选填）"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 邮箱 */}
            <div className="mb-6">
              <p className="text-sm text-on-surface-variant mb-3">邮箱</p>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="请输入邮箱（选填）"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleSaveUserInfo}
              disabled={userLoading}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {userLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setShowPasswordModal(false)}></div>
          <div className="relative bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-center mb-6">修改登录密码</h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-error/10 text-error rounded-xl text-sm text-center">{passwordError}</div>
            )}

            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">原密码</p>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入原密码"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">新密码</p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-6">
              <p className="text-sm text-on-surface-variant mb-3">确认新密码</p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {passwordLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 添加分类弹窗 */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setShowCategoryModal(false)}></div>
          <div className="relative bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-center mb-6">添加分类</h3>

            {/* 类型选择 */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setCategoryType('expense')}
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${categoryType === 'expense' ? 'bg-primary text-on-primary' : 'bg-white text-on-surface-variant'}`}
              >
                支出
              </button>
              <button
                onClick={() => setCategoryType('income')}
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${categoryType === 'income' ? 'bg-primary text-on-primary' : 'bg-white text-on-surface-variant'}`}
              >
                收入
              </button>
            </div>

            {/* Emoji选择 */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">选择图标</p>
              <div className="grid grid-cols-8 gap-2 p-4 bg-white rounded-xl max-h-48 overflow-y-auto">
                {emojiList.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-lg hover:bg-surface-container-high transition-all flex items-center justify-center text-xl ${selectedEmoji === emoji ? 'bg-primary-container ring-2 ring-primary' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-on-surface-variant">已选:</span>
                <span className="text-3xl">{selectedEmoji}</span>
              </div>
            </div>

            {/* 颜色选择 */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant mb-3">选择颜色</p>
              <div className="grid grid-cols-8 gap-2 p-4 bg-white rounded-xl">
                {colorList.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* 分类名称 */}
            <div className="mb-6">
              <p className="text-sm text-on-surface-variant mb-3">分类名称</p>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                maxLength={10}
                placeholder="请输入分类名称"
                className="w-full px-4 py-3 bg-white rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleAddCategory}
              disabled={categoryLoading}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {categoryLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  <span>添加</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-[90vw]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-error text-3xl">delete</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">删除分类</h3>
              <p className="text-sm text-on-surface-variant mb-6">确定要删除分类"{categoryToDelete.name}"吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-full font-semibold bg-surface-container text-on-surface-variant transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={categoryLoading}
                  className="flex-1 py-3 rounded-full font-semibold bg-error text-white transition-all disabled:opacity-50"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
