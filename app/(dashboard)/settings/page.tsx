"use client";

// 설정 페이지
// 사용자 프로필, 알림 설정, 계정 관리 (실제 푸시 구독 연동)

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, Bell, LogOut, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileImageUploader } from "@/components/settings/profile-image-uploader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/app/actions/notifications";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Tables } from "@/types/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // 사용자 정보 상태
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 푸시 구독 훅 사용
  const {
    isSupported,
    isSubscribed,
    isLoading: isPushLoading,
    permissionState,
    subscribe,
    unsubscribe,
    error: pushError,
  } = usePushSubscription();

  // 개별 알림 설정 상태 (DB 연동)
  const [newEventNotif, setNewEventNotif] = useState(true);
  const [reminderNotif, setReminderNotif] = useState(true);
  const [announcementNotif, setAnnouncementNotif] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profileData);
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
      } finally {
        setIsLoadingUser(false);
      }
    }

    loadUser();
  }, [supabase]);

  // DB에서 알림 설정 로드
  useEffect(() => {
    async function loadNotificationSettings() {
      try {
        const settings = await getNotificationSettings();
        setNewEventNotif(settings.newEventEnabled);
        setReminderNotif(settings.reminderEnabled);
        setAnnouncementNotif(settings.announcementEnabled);
      } catch (error) {
        console.error("알림 설정 로드 실패:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    }

    // 사용자 정보 로드 완료 후 설정 로드
    if (!isLoadingUser && user) {
      loadNotificationSettings();
    } else if (!isLoadingUser && !user) {
      setIsLoadingSettings(false);
    }
  }, [isLoadingUser, user]);

  // 개별 알림 토글 변경 핸들러 (Optimistic UI)
  const handleNotificationToggle = async (
    type: keyof NotificationSettings,
    checked: boolean
  ) => {
    // 1. 이전 상태 저장 (롤백용)
    const previousSettings = {
      newEventEnabled: newEventNotif,
      reminderEnabled: reminderNotif,
      announcementEnabled: announcementNotif,
    };

    // 2. 로컬 상태 즉시 업데이트 (Optimistic UI)
    switch (type) {
      case "newEventEnabled":
        setNewEventNotif(checked);
        break;
      case "reminderEnabled":
        setReminderNotif(checked);
        break;
      case "announcementEnabled":
        setAnnouncementNotif(checked);
        break;
    }

    // 3. DB에 저장
    const newSettings: NotificationSettings = {
      ...previousSettings,
      [type]: checked,
    };

    const result = await updateNotificationSettings(newSettings);

    // 4. 실패 시 롤백
    if (!result.success) {
      setNewEventNotif(previousSettings.newEventEnabled);
      setReminderNotif(previousSettings.reminderEnabled);
      setAnnouncementNotif(previousSettings.announcementEnabled);

      toast.error("설정 저장 실패", {
        description: result.error || "다시 시도해주세요.",
      });
    }
  };

  // 마스터 토글 변경 시 구독/해제 처리
  const handleMasterToggle = async (checked: boolean) => {
    if (checked) {
      // 구독 시도
      const success = await subscribe();
      if (success) {
        toast.success("푸시 알림이 활성화되었습니다!", {
          description: "새로운 이벤트와 공지사항을 실시간으로 받아보세요.",
        });
        // 개별 알림 활성화 및 DB 저장
        setNewEventNotif(true);
        setReminderNotif(true);
        setAnnouncementNotif(true);
        await updateNotificationSettings({
          newEventEnabled: true,
          reminderEnabled: true,
          announcementEnabled: true,
        });
      } else if (permissionState === "denied") {
        toast.error("알림 권한이 거부되었습니다", {
          description: "브라우저 설정에서 알림 권한을 허용해주세요.",
        });
      } else if (pushError) {
        toast.error("알림 설정 실패", {
          description: pushError,
        });
      }
    } else {
      // 구독 해제
      const success = await unsubscribe();
      if (success) {
        toast.success("푸시 알림이 비활성화되었습니다");
        // 개별 알림 비활성화 및 DB 저장
        setNewEventNotif(false);
        setReminderNotif(false);
        setAnnouncementNotif(false);
        await updateNotificationSettings({
          newEventEnabled: false,
          reminderEnabled: false,
          announcementEnabled: false,
        });
      } else {
        toast.error("알림 해제 실패", {
          description: "다시 시도해주세요.",
        });
      }
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("로그아웃되었습니다");
      router.push("/auth/login");
    } catch (error) {
      toast.error("로그아웃 실패", {
        description: "다시 시도해주세요.",
      });
    }
  };

  // 사용자 정보 로딩 중
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          설정
        </h1>
        <p className="text-muted-foreground mt-1">
          프로필과 알림 설정을 관리하세요
        </p>
      </div>

      {/* 프로필 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            프로필
          </CardTitle>
          <CardDescription>프로필 사진과 계정 정보를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 프로필 이미지 업로더 */}
          <ProfileImageUploader
            currentAvatarUrl={profile?.avatar_url}
            userName={profile?.full_name}
            userEmail={user?.email}
          />

          {/* 사용자 정보 */}
          <div className="text-center pt-4 border-t">
            <p className="font-semibold text-lg">
              {profile?.full_name || "사용자"}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.email || "이메일 없음"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 설정
          </CardTitle>
          <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 브라우저 미지원 경고 */}
          {!isSupported && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">
                  푸시 알림을 지원하지 않는 브라우저입니다
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  최신 Chrome, Firefox, Edge 브라우저에서 푸시 알림을 사용할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 권한 거부 경고 */}
          {isSupported && permissionState === "denied" && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  알림 권한이 차단되었습니다
                </p>
                <p className="text-sm text-red-700 mt-1">
                  브라우저 설정에서 이 사이트의 알림 권한을 허용해주세요.
                </p>
              </div>
            </div>
          )}

          {/* 마스터 토글 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base font-medium">
                푸시 알림
              </Label>
              <p className="text-sm text-muted-foreground">
                모든 푸시 알림을 활성화하거나 비활성화합니다
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPushLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                id="push-notifications"
                checked={isSubscribed}
                onCheckedChange={handleMasterToggle}
                disabled={!isSupported || isPushLoading || permissionState === "denied"}
              />
            </div>
          </div>

          <Separator />

          {/* 개별 알림 토글 */}
          <div className="space-y-4">
            {/* 새 이벤트 알림 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-event-notif" className="text-sm font-medium">
                  새 이벤트 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  모임에 새로운 이벤트가 생성되면 알림을 받습니다
                </p>
              </div>
              <Switch
                id="new-event-notif"
                checked={newEventNotif && isSubscribed}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("newEventEnabled", checked)
                }
                disabled={!isSubscribed || isLoadingSettings}
              />
            </div>

            {/* 리마인더 알림 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-notif" className="text-sm font-medium">
                  리마인더 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  이벤트 하루 전에 리마인더 알림을 받습니다
                </p>
              </div>
              <Switch
                id="reminder-notif"
                checked={reminderNotif && isSubscribed}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("reminderEnabled", checked)
                }
                disabled={!isSubscribed || isLoadingSettings}
              />
            </div>

            {/* 공지사항 알림 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="announcement-notif" className="text-sm font-medium">
                  공지사항 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  모임에 새로운 공지사항이 등록되면 알림을 받습니다
                </p>
              </div>
              <Switch
                id="announcement-notif"
                checked={announcementNotif && isSubscribed}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("announcementEnabled", checked)
                }
                disabled={!isSubscribed || isLoadingSettings}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
          <CardDescription>계정 관련 작업을 수행하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
