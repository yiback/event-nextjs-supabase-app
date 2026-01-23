// Service Worker for Web Push Notifications
// 웹 푸시 알림을 수신하고 표시하는 Service Worker

// 버전 관리 (캐시 무효화 시 변경)
const SW_VERSION = "1.0.0";

// 기본 아이콘 경로
const DEFAULT_ICON = "/icons/icon-192.png";
const DEFAULT_BADGE = "/icons/badge-72.png";

/**
 * Service Worker 설치 이벤트
 * 새 버전 설치 시 즉시 활성화
 */
self.addEventListener("install", (event) => {
  console.log(`[SW] Service Worker v${SW_VERSION} 설치됨`);
  // 대기 없이 즉시 활성화
  self.skipWaiting();
});

/**
 * Service Worker 활성화 이벤트
 * 이전 버전의 캐시 정리 및 클라이언트 제어 획득
 */
self.addEventListener("activate", (event) => {
  console.log(`[SW] Service Worker v${SW_VERSION} 활성화됨`);
  // 모든 클라이언트를 즉시 제어
  event.waitUntil(clients.claim());
});

/**
 * 푸시 알림 수신 이벤트
 * 서버에서 보낸 푸시 메시지를 받아 알림으로 표시
 */
self.addEventListener("push", (event) => {
  console.log("[SW] 푸시 알림 수신:", event);

  // 기본 알림 데이터
  let notificationData = {
    title: "새 알림",
    body: "새로운 알림이 있습니다.",
    icon: DEFAULT_ICON,
    badge: DEFAULT_BADGE,
    url: "/",
    tag: "default",
  };

  // 푸시 데이터 파싱
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || payload.message || notificationData.body,
        icon: payload.icon || DEFAULT_ICON,
        badge: payload.badge || DEFAULT_BADGE,
        url: payload.url || payload.link || "/",
        tag: payload.tag || payload.type || "default",
        // 추가 데이터
        data: payload.data || {},
      };
    } catch (error) {
      console.error("[SW] 푸시 데이터 파싱 실패:", error);
      // 텍스트로 시도
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // 알림 옵션 구성
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    // 클릭 시 사용할 데이터
    data: {
      url: notificationData.url,
      ...notificationData.data,
    },
    // 알림 동작 설정
    requireInteraction: false, // 자동으로 사라짐
    silent: false, // 소리 재생
    // 진동 패턴 (모바일)
    vibrate: [100, 50, 100],
    // 알림 액션 버튼 (선택사항)
    actions: [
      {
        action: "open",
        title: "열기",
      },
      {
        action: "close",
        title: "닫기",
      },
    ],
  };

  // 알림 표시
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

/**
 * 알림 클릭 이벤트
 * 사용자가 알림을 클릭했을 때 처리
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] 알림 클릭:", event);

  // 알림 닫기
  event.notification.close();

  // 액션 버튼 처리
  if (event.action === "close") {
    // 닫기 버튼 클릭 시 아무것도 하지 않음
    return;
  }

  // 이동할 URL 결정
  const urlToOpen = event.notification.data?.url || "/";

  // 클라이언트 창 열기 또는 포커스
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // 열려있는 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * 알림 닫기 이벤트
 * 사용자가 알림을 닫았을 때 처리 (선택사항)
 */
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] 알림 닫힘:", event.notification.tag);
  // 분석 목적으로 로깅하거나 서버에 보고할 수 있음
});

/**
 * 메시지 이벤트
 * 클라이언트에서 보낸 메시지 처리
 */
self.addEventListener("message", (event) => {
  console.log("[SW] 메시지 수신:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Service Worker 준비 완료 로그
console.log(`[SW] Service Worker v${SW_VERSION} 로드됨`);
