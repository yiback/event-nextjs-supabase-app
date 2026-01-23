"use client";

// 푸시 알림 배너 컴포넌트
// 푸시 알림 구독을 유도하는 배너, 실제 구독 로직 연동

import { useState, useEffect } from "react";
import { Bell, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { toast } from "sonner";

const STORAGE_KEY = "push_banner_dismissed";

export function PushNotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permissionState,
    subscribe,
    error,
  } = usePushSubscription();

  // localStorage에서 배너 상태 불러오기 및 구독 상태 확인
  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);

    // 이미 구독 중이거나, 배너를 닫은 적이 있거나, 권한이 거부된 경우 숨김
    if (isSubscribed || isDismissed || permissionState === "denied") {
      setIsVisible(false);
    } else if (!isLoading) {
      // 로딩이 완료된 후에만 표시 여부 결정
      setIsVisible(true);
    }
  }, [isSubscribed, isLoading, permissionState]);

  // 알림 켜기 버튼 클릭
  const handleEnableNotifications = async () => {
    const success = await subscribe();

    if (success) {
      toast.success("푸시 알림이 활성화되었습니다!", {
        description: "새로운 이벤트와 공지사항을 실시간으로 받아보세요.",
      });
      localStorage.setItem(STORAGE_KEY, "true");
      setIsVisible(false);
    } else if (permissionState === "denied") {
      toast.error("알림 권한이 거부되었습니다", {
        description: "브라우저 설정에서 알림 권한을 허용해주세요.",
      });
    } else if (error) {
      toast.error("알림 설정 실패", {
        description: error,
      });
    }
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

  // 브라우저가 푸시를 지원하지 않는 경우
  if (!isSupported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">
              푸시 알림을 지원하지 않는 브라우저입니다
            </h3>
            <p className="text-sm text-amber-700">
              최신 Chrome, Firefox, Edge 브라우저에서 푸시 알림을 사용할 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-amber-600 hover:text-amber-700"
            aria-label="배너 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
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
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  설정 중...
                </>
              ) : (
                "알림 켜기"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              disabled={isLoading}
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
