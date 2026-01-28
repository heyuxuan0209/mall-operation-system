'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Trash2, CheckCheck, Filter } from 'lucide-react';
import { notificationService } from '@/utils/notificationService';
import { AppNotification } from '../../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AppNotification[]>([]);
  const [filterType, setFilterType] = useState<'all' | AppNotification['type']>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filterType, filterRead]);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // 按已读/未读筛选
    if (filterRead === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有通知吗？')) {
      notificationService.clearAllNotifications();
      loadNotifications();
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
      loadNotifications();
    }
  };

  // 获取通知图标颜色
  const getNotificationColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'task_overdue':
        return 'text-red-600 bg-red-50';
      case 'task_deadline':
        return 'text-orange-600 bg-orange-50';
      case 'task_assigned':
        return 'text-blue-600 bg-blue-50';
      case 'task_status_change':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取通知类型标签
  const getTypeLabel = (type: AppNotification['type']) => {
    switch (type) {
      case 'task_overdue':
        return '逾期警告';
      case 'task_deadline':
        return '截止提醒';
      case 'task_assigned':
        return '任务分配';
      case 'task_status_change':
        return '状态变更';
      default:
        return '通知';
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
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">通知中心</h1>
              <p className="text-sm text-gray-500 mt-1">
                共 {notifications.length} 条通知，{unreadCount} 条未读
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCheck size={16} />
                  全部已读
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  清空
                </button>
              )}
            </div>
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">筛选：</span>
            </div>

            {/* 按已读状态筛选 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRead('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterRead === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterRead('unread')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterRead === 'unread'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                未读
              </button>
              <button
                onClick={() => setFilterRead('read')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterRead === 'read'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                已读
              </button>
            </div>

            {/* 按类型筛选 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterType === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                所有类型
              </button>
              <button
                onClick={() => setFilterType('task_overdue')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterType === 'task_overdue'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                逾期警告
              </button>
              <button
                onClick={() => setFilterType('task_deadline')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterType === 'task_deadline'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                截止提醒
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无通知</h3>
            <p className="text-sm text-gray-500">
              {filterType !== 'all' || filterRead !== 'all'
                ? '没有符合筛选条件的通知'
                : '您目前没有任何通知'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  !notification.read
                    ? 'border-blue-200 bg-blue-50/30'
                    : 'border-gray-200'
                }`}
              >
                <Link
                  href={`/tasks?taskId=${notification.taskId}`}
                  onClick={() => handleNotificationClick(notification)}
                  className="block p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* 图标 */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      <Bell size={18} />
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            {getTypeLabel(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <h3
                        className={`text-base font-semibold text-gray-900 mb-1 ${
                          !notification.read ? 'font-bold' : ''
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>商户：{notification.merchantName}</span>
                        <span>•</span>
                        <span>任务ID：{notification.taskId}</span>
                      </div>
                    </div>

                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除通知"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
