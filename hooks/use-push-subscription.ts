"use client";

// 푸시 알림 구독 관리 Hook
// Service Worker 등록, 푸시 구독/해지, 권한 상태 관리

import { useState, useEffect, useCallback } from "react";
import { urlBase64ToUint8Array } from "@/lib/utils";

// 권한 상태 타입
type PermissionState = "granted" | "denied" | "default" | "unsupported";

// Hook 반환 타입
interface UsePushSubscriptionReturn {
  /** 브라우저가 푸시 알림을 지원하는지 여부 */
  isSupported: boolean;
  /** 현재 푸시 구독이 활성화되어 있는지 여부 */
  isSubscribed: boolean;
  /** 구독/해지 작업이 진행 중인지 여부 */
  isLoading: boolean;
  /** 알림 권한 상태 */
  permissionState: PermissionState;
  /** 푸시 알림 구독 시작 */
  subscribe: () => Promise<boolean>;
  /** 푸시 알림 구독 해지 */
  unsubscribe: () => Promise<boolean>;
  /** 현재 구독 객체 (디버깅용) */
  subscription: PushSubscription | null;
  /** 에러 메시지 */
  error: string | null;
}

// VAPID 공개키 (환경변수에서 가져옴)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * 푸시 알림 구독을 관리하는 React Hook
 *
 * @example
 * ```tsx
 * const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushSubscription();
 *
 * if (!isSupported) return <p>브라우저가 푸시 알림을 지원하지 않습니다.</p>;
 *
 * return (
 *   <button onClick={isSubscribed ? unsubscribe : subscribe}>
 *     {isSubscribed ? '알림 끄기' : '알림 켜기'}
 *   </button>
 * );
 * ```
 */
export function usePushSubscription(): UsePushSubscriptionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<PermissionState>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 브라우저 지원 여부 및 현재 구독 상태 확인
  useEffect(() => {
    const checkSupport = async () => {
      // 브라우저 지원 여부 확인
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setIsSupported(false);
        setPermissionState("unsupported");
        setIsLoading(false);
        return;
      }

      setIsSupported(true);

      // VAPID 키 확인
      if (!VAPID_PUBLIC_KEY) {
        console.warn("[usePushSubscription] VAPID 공개키가 설정되지 않았습니다.");
        setError("푸시 알림 설정이 완료되지 않았습니다.");
        setIsLoading(false);
        return;
      }

      try {
        // 현재 권한 상태 확인
        const permission = Notification.permission;
        setPermissionState(permission);

        // 기존 Service Worker 등록 확인
        const registration = await navigator.serviceWorker.getRegistration("/sw.js");
        if (registration) {
          // 기존 구독 확인
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            setSubscription(existingSubscription);
            setIsSubscribed(true);
          }
        }
      } catch (err) {
        console.error("[usePushSubscription] 초기화 오류:", err);
        setError("푸시 알림 상태를 확인하는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSupport();
  }, []);

  // 푸시 알림 구독
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !VAPID_PUBLIC_KEY) {
      setError("푸시 알림을 사용할 수 없습니다.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 알림 권한 요청
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== "granted") {
        setError("알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.");
        return false;
      }

      // 2. Service Worker 등록
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Service Worker가 활성화될 때까지 대기
      await navigator.serviceWorker.ready;

      // 3. 푸시 구독 생성
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // 사용자에게 보이는 알림만 허용 (필수)
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // 4. 서버에 구독 정보 저장
      const subscriptionJson = pushSubscription.toJSON();
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh,
            auth: subscriptionJson.keys?.auth,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "서버에 구독 정보를 저장하는데 실패했습니다.");
      }

      // 5. 상태 업데이트
      setSubscription(pushSubscription);
      setIsSubscribed(true);
      console.log("[usePushSubscription] 구독 성공:", pushSubscription.endpoint);

      return true;
    } catch (err) {
      console.error("[usePushSubscription] 구독 오류:", err);
      setError(err instanceof Error ? err.message : "구독 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // 푸시 알림 구독 해지
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      setError("활성화된 구독이 없습니다.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 서버에서 구독 정보 삭제
      const response = await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[usePushSubscription] 서버 구독 삭제 실패:", errorData);
        // 서버 삭제 실패해도 로컬 구독은 해지 시도
      }

      // 2. 브라우저에서 구독 해지
      const unsubscribed = await subscription.unsubscribe();

      if (unsubscribed) {
        setSubscription(null);
        setIsSubscribed(false);
        console.log("[usePushSubscription] 구독 해지 성공");
        return true;
      } else {
        throw new Error("브라우저에서 구독을 해지하지 못했습니다.");
      }
    } catch (err) {
      console.error("[usePushSubscription] 구독 해지 오류:", err);
      setError(err instanceof Error ? err.message : "구독 해지 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permissionState,
    subscribe,
    unsubscribe,
    subscription,
    error,
  };
}
