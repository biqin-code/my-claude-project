import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

/**
 * 用户头像菜单组件
 * 点击头像显示下拉菜单，包含设置和退出登录
 */
export default function UserAvatarMenu({ user, className = '' }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (showMenu && !event.target.closest('.user-avatar-menu')) {
        setShowMenu(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const renderAvatar = () => {
    const avatar = user?.avatarUrl || user?.avatar_url || '👤';
    if (avatar.startsWith('data:')) {
      return <img src={avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />;
    }
    return <span className="text-2xl">{avatar}</span>;
  };

  return (
    <div className={`relative user-avatar-menu ${className}`}>
      <div
        className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
      >
        {renderAvatar()}
      </div>

      {showMenu && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="font-medium text-gray-900">{user?.nickname || user?.username}</div>
            <div className="text-xs text-gray-500">{user?.email || '未设置邮箱'}</div>
          </div>
          <button
            onClick={() => { setShowMenu(false); navigate('/settings'); }}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            设置
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
