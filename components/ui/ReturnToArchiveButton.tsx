'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ReturnToArchiveButtonProps {
  merchantId?: string;
  className?: string;
}

/**
 * 返回帮扶档案按钮组件内部实现
 */
function ReturnToArchiveButtonContent({ merchantId, className = '' }: ReturnToArchiveButtonProps) {
  const searchParams = useSearchParams();
  const fromArchive = searchParams.get('fromArchive');
  const urlMerchantId = searchParams.get('merchantId');

  // 只有从档案页跳转过来时才显示
  if (!fromArchive) {
    return null;
  }

  // 使用props传入的merchantId或URL参数中的merchantId
  const targetMerchantId = merchantId || urlMerchantId;

  if (!targetMerchantId) {
    return null;
  }

  return (
    <Link
      href={`/archives/${targetMerchantId}`}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm ${className}`}
    >
      <i className="fas fa-arrow-left"></i>
      返回帮扶档案
    </Link>
  );
}

/**
 * 返回帮扶档案按钮组件（带Suspense包裹）
 */
export function ReturnToArchiveButton(props: ReturnToArchiveButtonProps) {
  return (
    <Suspense fallback={null}>
      <ReturnToArchiveButtonContent {...props} />
    </Suspense>
  );
}

export default ReturnToArchiveButton;
