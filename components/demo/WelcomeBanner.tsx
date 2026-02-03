"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * 欢迎横幅组件
 * 首次访问时显示，说明这是作品集Demo项目
 */
export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 检查用户是否已经关闭过横幅
    const hasClosedBanner = localStorage.getItem("welcomeBannerClosed");
    if (!hasClosedBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("welcomeBannerClosed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <div>
                <p className="font-semibold text-sm md:text-base">
                  欢迎体验商户智运Agent - AI驱动的商户健康管理系统
                </p>
                <p className="text-xs md:text-sm text-blue-100 mt-0.5">
                  这是个人作品集项目，展示AI产品设计与全栈开发能力 | Demo版本，数据仅供演示
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 p-1 hover:bg-blue-800 rounded-full transition-colors flex-shrink-0"
            aria-label="关闭横幅"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
