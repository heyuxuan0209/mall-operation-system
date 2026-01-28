'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { notificationService } from '@/utils/notificationService';
import { AppNotification } from '../types';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // 加载通知
  useEffect(() => {
    loadNotifications();

    // 每30秒刷新一次
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications.slice(0, 5)); // 只显示最近5条
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleNotificationClick = (notification: AppNotification) => {
    notificationService.markAsRead(notification.id);
    setShowDropdown(false);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  // 获取通知图标颜色
  const getNotificationColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'task_overdue':
        return 'text-red-600';
      case 'task_deadline':
        return 'text-orange-600';
      case 'task_assigned':
        return 'text-blue-600';
      case 'task_status_change':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="relative">
      {/* 通知图标 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 下拉通知列表 */}
      {showDropdown && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* 通知面板 */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">通知</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    全部已读
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 通知列表 */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Bell size={48} className="mb-3 opacity-50" />
                  <p className="text-sm">暂无通知</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={`/tasks?taskId=${notification.taskId}`}
                      onClick={() => handleNotificationClick(notification)}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-1 ${getNotificationColor(notification.type)}`}>
                          <Bell size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 底部 */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3">
                <Link
                  href="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看全部通知
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
