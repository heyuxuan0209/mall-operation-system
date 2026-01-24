import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string; // FontAwesome class
  trend?: string;
  trendUp?: boolean;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  color = "text-brand-600",
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-200
      ${onClick ? 'cursor-pointer hover:shadow-md hover:border-brand-200 hover:-translate-y-1 active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
        <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {trend && (
          <div className={`text-xs font-medium flex items-center ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            <i className={`fa-solid ${trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
