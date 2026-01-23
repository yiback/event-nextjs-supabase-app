"use client";

// 멤버 목록 아이템 컴포넌트
// 멤버 관리 페이지에서 각 멤버를 표시

import type { GroupMemberWithProfile } from "@/types/database";
import type { Role } from "@/types/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserMinus } from "lucide-react";
import { canManageMembers, canRemoveMember } from "@/lib/utils/permissions";

// 역할 레이블 매핑
const roleLabels: Record<Role, string> = {
  owner: "모임장",
  admin: "관리자",
  member: "멤버",
};

// 이름에서 이니셜 추출
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface MemberListItemProps {
  member: GroupMemberWithProfile;
  currentUserRole: Role;
  currentUserId: string;
  onRoleChange?: (memberId: string, newRole: Role) => void;
  onRemove?: (member: GroupMemberWithProfile) => void;
  isLoading?: boolean;
}

export function MemberListItem({
  member,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onRemove,
  isLoading = false,
}: MemberListItemProps) {
  const isCurrentUser = member.user_id === currentUserId;

  // 역할 변경 가능 여부 확인
  // - 현재 사용자가 owner/admin이어야 함
  // - 대상이 owner가 아니어야 함 (owner는 변경 불가)
  // - 본인이 아니어야 함
  const canChangeRole =
    canManageMembers(currentUserRole) &&
    member.role !== "owner" &&
    !isCurrentUser;

  // owner는 admin만 변경 가능, admin은 member만 변경 가능
  const availableRoles: Role[] =
    currentUserRole === "owner" ? ["admin", "member"] : ["member"];

  // 멤버 제거 가능 여부
  const canRemove =
    canRemoveMember(currentUserRole, member.role) && !isCurrentUser;

  const handleRoleChange = (newRole: string) => {
    if (onRoleChange && !isLoading) {
      onRoleChange(member.id, newRole as Role);
    }
  };

  const handleRemove = () => {
    if (onRemove && !isLoading) {
      onRemove(member);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      {/* 멤버 정보 */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={member.profile.avatar_url ?? undefined}
            alt={member.profile.full_name}
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(member.profile.full_name)}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-medium">
            {member.profile.full_name}
            {isCurrentUser && (
              <span className="text-sm text-muted-foreground ml-2">(나)</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {member.profile.email}
          </p>
        </div>
      </div>

      {/* 역할 표시/변경 및 제거 버튼 */}
      <div className="flex items-center gap-2">
        {canChangeRole ? (
          // 역할 변경 드롭다운
          <Select
            value={member.role}
            onValueChange={handleRoleChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {member.role === "admin" && (
                <SelectItem value="admin">관리자</SelectItem>
              )}
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabels[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          // 역할 뱃지 (변경 불가)
          <Badge variant={member.role}>{roleLabels[member.role]}</Badge>
        )}

        {/* 제거 버튼 */}
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isLoading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="멤버 제거"
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
