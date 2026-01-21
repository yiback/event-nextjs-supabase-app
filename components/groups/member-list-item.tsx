"use client";

// 멤버 목록 아이템 컴포넌트
// 멤버 관리 페이지에서 각 멤버를 표시

import type { GroupMemberWithProfile } from "@/types/database";
import type { Role } from "@/types/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onRoleChange?: (memberId: string, newRole: Role) => void;
}

export function MemberListItem({
  member,
  currentUserRole,
  onRoleChange,
}: MemberListItemProps) {
  // 역할 변경 가능 여부 확인
  // - 현재 사용자가 owner/admin이어야 함
  // - 대상이 owner가 아니어야 함 (owner는 변경 불가)
  const canChangeRole =
    (currentUserRole === "owner" || currentUserRole === "admin") &&
    member.role !== "owner";

  // owner는 admin만 변경 가능, admin은 member만 변경 가능
  const availableRoles: Role[] =
    currentUserRole === "owner" ? ["admin", "member"] : ["member"];

  const handleRoleChange = (newRole: string) => {
    if (onRoleChange) {
      onRoleChange(member.id, newRole as Role);
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
          <p className="font-medium">{member.profile.full_name}</p>
          <p className="text-sm text-muted-foreground">
            {member.profile.email}
          </p>
        </div>
      </div>

      {/* 역할 표시/변경 */}
      <div className="flex items-center gap-2">
        {canChangeRole ? (
          // 역할 변경 드롭다운
          <Select
            value={member.role}
            onValueChange={handleRoleChange}
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
      </div>
    </div>
  );
}
