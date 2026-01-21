"use client";

// 푸시 알림 배너 컴포넌트
// localStorage로 상태 관리, 사용자가 닫으면 다시 표시하지 않음

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "push_banner_dismissed";

export function PushNotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // localStorage에서 배너 상태 불러오기
  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  // 알림 켜기 버튼 클릭
  const handleEnableNotifications = async () => {
    // TODO: 실제 푸시 알림 권한 요청 로직 구현
    console.log("푸시 알림 권한 요청");

    // 배너 숨기기
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  // 나중에 버튼 클릭
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  // 배너가 보이지 않으면 렌더링하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-900 mb-1">
            알림을 켜고 중요한 소식을 받아보세요
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            새로운 이벤트, 공지사항, 참석 마감 알림을 실시간으로 받을 수 있습니다.
          </p>

          {/* 버튼 그룹 */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="bg-blue-600 hover:bg-blue-700"
            >
              알림 켜기
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              나중에
            </Button>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-600 hover:text-blue-700"
          aria-label="배너 닫기"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
