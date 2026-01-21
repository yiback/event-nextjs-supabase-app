"use client";

// 설정 페이지
// 사용자 프로필, 알림 설정, 계정 관리

import { useState } from "react";
import { Settings, User, Bell, LogOut } from "lucide-react";
import { currentUserId, mockProfiles } from "@/lib/mock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  // 현재 사용자 정보
  const currentUser = mockProfiles.find((p) => p.id === currentUserId);

  // 알림 설정 로컬 상태
  const [pushEnabled, setPushEnabled] = useState(true);
  const [newEventNotif, setNewEventNotif] = useState(true);
  const [reminderNotif, setReminderNotif] = useState(true);
  const [announcementNotif, setAnnouncementNotif] = useState(true);

  // 마스터 토글 변경 시 모든 개별 토글도 변경
  const handleMasterToggle = (checked: boolean) => {
    setPushEnabled(checked);
    if (!checked) {
      setNewEventNotif(false);
      setReminderNotif(false);
      setAnnouncementNotif(false);
    }
  };

  // 로그아웃 처리 (UI만, 실제 로직은 Phase 3)
  const handleLogout = () => {
    toast.success("로그아웃되었습니다");
  };

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
          <CardDescription>계정 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.avatar_url || undefined} alt={currentUser?.full_name} />
              <AvatarFallback className="text-lg">
                {currentUser?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{currentUser?.full_name}</p>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>
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
            <Switch
              id="push-notifications"
              checked={pushEnabled}
              onCheckedChange={handleMasterToggle}
            />
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
                checked={newEventNotif}
                onCheckedChange={setNewEventNotif}
                disabled={!pushEnabled}
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
                checked={reminderNotif}
                onCheckedChange={setReminderNotif}
                disabled={!pushEnabled}
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
                checked={announcementNotif}
                onCheckedChange={setAnnouncementNotif}
                disabled={!pushEnabled}
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
