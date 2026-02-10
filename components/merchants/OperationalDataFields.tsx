'use client';

import React from 'react';
import { OperationalDetails } from '@/types';
import {
  FIELD_LABELS,
  FIELD_UNITS,
  FIELD_TOOLTIPS,
  COMPETITIVE_POSITION_OPTIONS,
  ZONE_TYPE_OPTIONS,
} from '@/config/operationalDataConfig';

interface FormFieldProps {
  label: string;
  type: 'number' | 'text' | 'select';
  unit?: string;
  value: string | number | boolean | undefined;
  onChange: (value: any) => void;
  error?: string;
  tooltip?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  unit,
  value,
  onChange,
  error,
  tooltip,
  options,
  min,
  max,
  step,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-gray-700">
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400 cursor-help" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>
      <div className="flex items-center gap-2">
        {type === 'select' && options ? (
          <select
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`border rounded px-3 py-2 flex-1 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">请选择</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'number' ? (
          <input
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
            className={`border rounded px-3 py-2 flex-1 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            min={min}
            max={max}
            step={step || 0.1}
          />
        ) : (
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`border rounded px-3 py-2 flex-1 ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        )}
        {unit && <span className="text-sm text-gray-500 min-w-[60px]">{unit}</span>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, value, onChange }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
};

// 通用数据组
export const GeneralFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">通用数据</h4>
      <FormField
        label={FIELD_LABELS.dailyFootfall}
        type="number"
        unit={FIELD_UNITS.dailyFootfall}
        value={data.dailyFootfall}
        onChange={(v) => onChange('dailyFootfall', v)}
        error={errors.dailyFootfall}
        tooltip={FIELD_TOOLTIPS.dailyFootfall}
        min={0}
      />
      <FormField
        label={FIELD_LABELS.peakHourFootfall}
        type="number"
        unit={FIELD_UNITS.peakHourFootfall}
        value={data.peakHourFootfall}
        onChange={(v) => onChange('peakHourFootfall', v)}
        error={errors.peakHourFootfall}
        tooltip={FIELD_TOOLTIPS.peakHourFootfall}
        min={0}
      />
      <FormField
        label={FIELD_LABELS.conversionRate}
        type="number"
        unit={FIELD_UNITS.conversionRate}
        value={data.conversionRate}
        onChange={(v) => onChange('conversionRate', v)}
        error={errors.conversionRate}
        tooltip={FIELD_TOOLTIPS.conversionRate}
        min={0}
        max={100}
      />
    </div>
  );
};

// 餐饮专属字段组
export const RestaurantFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const restaurant = data.restaurant || {};

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">餐饮运营数据</h4>
      <FormField
        label={FIELD_LABELS['restaurant.tableCount']}
        type="number"
        unit={FIELD_UNITS['restaurant.tableCount']}
        value={restaurant.tableCount}
        onChange={(v) => onChange('restaurant.tableCount', v)}
        error={errors['restaurant.tableCount']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['restaurant.seatingCapacity']}
        type="number"
        unit={FIELD_UNITS['restaurant.seatingCapacity']}
        value={restaurant.seatingCapacity}
        onChange={(v) => onChange('restaurant.seatingCapacity', v)}
        error={errors['restaurant.seatingCapacity']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['restaurant.turnoverRate']}
        type="number"
        unit={FIELD_UNITS['restaurant.turnoverRate']}
        value={restaurant.turnoverRate}
        onChange={(v) => onChange('restaurant.turnoverRate', v)}
        error={errors['restaurant.turnoverRate']}
        tooltip={FIELD_TOOLTIPS['restaurant.turnoverRate']}
        min={0}
        max={20}
      />
      <FormField
        label={FIELD_LABELS['restaurant.avgWaitTime']}
        type="number"
        unit={FIELD_UNITS['restaurant.avgWaitTime']}
        value={restaurant.avgWaitTime}
        onChange={(v) => onChange('restaurant.avgWaitTime', v)}
        error={errors['restaurant.avgWaitTime']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['restaurant.avgMealDuration']}
        type="number"
        unit={FIELD_UNITS['restaurant.avgMealDuration']}
        value={restaurant.avgMealDuration}
        onChange={(v) => onChange('restaurant.avgMealDuration', v)}
        error={errors['restaurant.avgMealDuration']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['restaurant.errorOrderRate']}
        type="number"
        unit={FIELD_UNITS['restaurant.errorOrderRate']}
        value={restaurant.errorOrderRate}
        onChange={(v) => onChange('restaurant.errorOrderRate', v)}
        error={errors['restaurant.errorOrderRate']}
        tooltip={FIELD_TOOLTIPS['restaurant.errorOrderRate']}
        min={0}
        max={100}
      />
      <FormField
        label={FIELD_LABELS['restaurant.avgCheckSize']}
        type="number"
        unit={FIELD_UNITS['restaurant.avgCheckSize']}
        value={restaurant.avgCheckSize}
        onChange={(v) => onChange('restaurant.avgCheckSize', v)}
        error={errors['restaurant.avgCheckSize']}
        min={0}
      />
    </div>
  );
};

// 零售专属字段组
export const RetailFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const retail = data.retail || {};

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">零售运营数据</h4>
      <FormField
        label={FIELD_LABELS['retail.dailySales']}
        type="number"
        unit={FIELD_UNITS['retail.dailySales']}
        value={retail.dailySales}
        onChange={(v) => onChange('retail.dailySales', v)}
        error={errors['retail.dailySales']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['retail.avgTransactionValue']}
        type="number"
        unit={FIELD_UNITS['retail.avgTransactionValue']}
        value={retail.avgTransactionValue}
        onChange={(v) => onChange('retail.avgTransactionValue', v)}
        error={errors['retail.avgTransactionValue']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['retail.inventoryTurnover']}
        type="number"
        unit={FIELD_UNITS['retail.inventoryTurnover']}
        value={retail.inventoryTurnover}
        onChange={(v) => onChange('retail.inventoryTurnover', v)}
        error={errors['retail.inventoryTurnover']}
        tooltip={FIELD_TOOLTIPS['retail.inventoryTurnover']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['retail.returnRate']}
        type="number"
        unit={FIELD_UNITS['retail.returnRate']}
        value={retail.returnRate}
        onChange={(v) => onChange('retail.returnRate', v)}
        error={errors['retail.returnRate']}
        min={0}
        max={100}
      />
    </div>
  );
};

// 顾客数据字段组
export const CustomerFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const customer = data.customer || {};

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">顾客数据</h4>
      <FormField
        label={FIELD_LABELS['customer.npsScore']}
        type="number"
        unit={FIELD_UNITS['customer.npsScore']}
        value={customer.npsScore}
        onChange={(v) => onChange('customer.npsScore', v)}
        error={errors['customer.npsScore']}
        tooltip={FIELD_TOOLTIPS['customer.npsScore']}
        min={-100}
        max={100}
      />
      <FormField
        label={FIELD_LABELS['customer.repeatCustomerRate']}
        type="number"
        unit={FIELD_UNITS['customer.repeatCustomerRate']}
        value={customer.repeatCustomerRate}
        onChange={(v) => onChange('customer.repeatCustomerRate', v)}
        error={errors['customer.repeatCustomerRate']}
        tooltip={FIELD_TOOLTIPS['customer.repeatCustomerRate']}
        min={0}
        max={100}
      />
      <FormField
        label={FIELD_LABELS['customer.newCustomerRatio']}
        type="number"
        unit={FIELD_UNITS['customer.newCustomerRatio']}
        value={customer.newCustomerRatio}
        onChange={(v) => onChange('customer.newCustomerRatio', v)}
        error={errors['customer.newCustomerRatio']}
        min={0}
        max={100}
      />
      <FormField
        label={FIELD_LABELS['customer.avgCustomerLifetime']}
        type="number"
        unit={FIELD_UNITS['customer.avgCustomerLifetime']}
        value={customer.avgCustomerLifetime}
        onChange={(v) => onChange('customer.avgCustomerLifetime', v)}
        error={errors['customer.avgCustomerLifetime']}
        min={0}
      />
    </div>
  );
};

// 员工数据字段组
export const StaffFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const staff = data.staff || {};

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">员工数据</h4>
      <FormField
        label={FIELD_LABELS['staff.totalCount']}
        type="number"
        unit={FIELD_UNITS['staff.totalCount']}
        value={staff.totalCount}
        onChange={(v) => onChange('staff.totalCount', v)}
        error={errors['staff.totalCount']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['staff.fullTimeCount']}
        type="number"
        unit={FIELD_UNITS['staff.fullTimeCount']}
        value={staff.fullTimeCount}
        onChange={(v) => onChange('staff.fullTimeCount', v)}
        error={errors['staff.fullTimeCount']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['staff.partTimeCount']}
        type="number"
        unit={FIELD_UNITS['staff.partTimeCount']}
        value={staff.partTimeCount}
        onChange={(v) => onChange('staff.partTimeCount', v)}
        error={errors['staff.partTimeCount']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['staff.turnoverRate']}
        type="number"
        unit={FIELD_UNITS['staff.turnoverRate']}
        value={staff.turnoverRate}
        onChange={(v) => onChange('staff.turnoverRate', v)}
        error={errors['staff.turnoverRate']}
        tooltip={FIELD_TOOLTIPS['staff.turnoverRate']}
        min={0}
        max={100}
      />
      <FormField
        label={FIELD_LABELS['staff.avgTenure']}
        type="number"
        unit={FIELD_UNITS['staff.avgTenure']}
        value={staff.avgTenure}
        onChange={(v) => onChange('staff.avgTenure', v)}
        error={errors['staff.avgTenure']}
        min={0}
      />
    </div>
  );
};

// 竞争环境字段组
export const CompetitionFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const competition = data.competition || {};

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">竞争环境</h4>
      <FormField
        label={FIELD_LABELS['competition.nearbyCompetitors']}
        type="number"
        unit={FIELD_UNITS['competition.nearbyCompetitors']}
        value={competition.nearbyCompetitors}
        onChange={(v) => onChange('competition.nearbyCompetitors', v)}
        error={errors['competition.nearbyCompetitors']}
        tooltip={FIELD_TOOLTIPS['competition.nearbyCompetitors']}
        min={0}
      />
      <FormField
        label={FIELD_LABELS['competition.marketShare']}
        type="number"
        unit={FIELD_UNITS['competition.marketShare']}
        value={competition.marketShare}
        onChange={(v) => onChange('competition.marketShare', v)}
        error={errors['competition.marketShare']}
        min={0}
        max={100}
      />
      <FormField
        label={FIELD_LABELS['competition.competitivePosition']}
        type="select"
        value={competition.competitivePosition}
        onChange={(v) => onChange('competition.competitivePosition', v)}
        error={errors['competition.competitivePosition']}
        options={COMPETITIVE_POSITION_OPTIONS}
      />
    </div>
  );
};

// 位置数据字段组
export const LocationFields: React.FC<{
  data: OperationalDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const location = (data.location || {}) as NonNullable<OperationalDetails['location']>;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-3">位置数据</h4>
      <FormField
        label={FIELD_LABELS['location.floor']}
        type="text"
        value={location.floor}
        onChange={(v) => onChange('location.floor', v)}
        error={errors['location.floor']}
      />
      <FormField
        label={FIELD_LABELS['location.zoneType']}
        type="select"
        value={location.zoneType}
        onChange={(v) => onChange('location.zoneType', v)}
        error={errors['location.zoneType']}
        options={ZONE_TYPE_OPTIONS}
      />
      <CheckboxField
        label={FIELD_LABELS['location.adjacentToAnchor']}
        value={location.adjacentToAnchor || false}
        onChange={(v) => onChange('location.adjacentToAnchor', v)}
      />
      <FormField
        label={FIELD_LABELS['location.visibilityRating']}
        type="number"
        unit={FIELD_UNITS['location.visibilityRating']}
        value={location.visibilityRating}
        onChange={(v) => onChange('location.visibilityRating', v)}
        error={errors['location.visibilityRating']}
        tooltip={FIELD_TOOLTIPS['location.visibilityRating']}
        min={1}
        max={5}
      />
    </div>
  );
};
