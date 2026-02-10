/**
 * AI助手响应可视化组件
 * 用于展示统计数据、图表等
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// 统计卡片
export function StatCard({ label, value, trend, color = 'blue' }: {
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="text-sm opacity-75 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      {trend && (
        <div className={`text-xs mt-2 flex items-center gap-1 ${trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
          {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// 统计卡片网格
export function StatGrid({ stats }: { stats: Array<{ label: string; value: string | number; color?: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-3 my-3">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} color={stat.color as any} />
      ))}
    </div>
  );
}

// 饼图组件
export function PieChartCard({ title, data }: {
  title: string;
  data: Array<{ name: string; value: number; color: string }>;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 my-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 柱状图组件
export function BarChartCard({ title, data, xKey, yKey }: {
  title: string;
  data: Array<any>;
  xKey: string;
  yKey: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 my-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={yKey} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 列表卡片
export function ListCard({ title, items }: {
  title?: string;
  items: Array<{ label: string; value: string; badge?: { text: string; color: string } }>;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 my-3">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-700">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.badge.color}`}>
                  {item.badge.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 分组列表
export function GroupedList({ groups }: {
  groups: Array<{ title: string; items: Array<{ label: string; value: string }> }>;
}) {
  return (
    <div className="space-y-3 my-3">
      {groups.map((group, i) => (
        <ListCard key={i} title={group.title} items={group.items} />
      ))}
    </div>
  );
}
