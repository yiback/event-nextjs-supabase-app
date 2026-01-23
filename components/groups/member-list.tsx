"use client";

// 멤버 목록 컴포넌트
// 역할 변경 및 멤버 제거 기능 포함

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { GroupMemberWithProfile } from "@/types/database";
import type { Role } from "@/types/enums";
import { updateMemberRole, removeMember } from "@/app/actions/members";
import { MemberListItem } from "./member-list-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MemberListProps {
  groupId: string;
  members: GroupMemberWithProfile[];
  currentUserRole: Role;
  currentUserId: string;
}

export function MemberList({
  groupId,
  members,
  currentUserRole,
  currentUserId,
}: MemberListProps) {
  const router = useRouter();
  const [isRoleChanging, setIsRoleChanging] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [memberToRemove, setMemberToRemove] =
    useState<GroupMemberWithProfile | null>(null);

  /**
   * 역할 변경 핸들러
   */
  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setIsRoleChanging(true);

    try {
      const result = await updateMemberRole(groupId, memberId, newRole);

      if (result.success) {
        toast.success("역할이 변경되었습니다");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("역할 변경 오류:", error);
      toast.error("역할 변경 중 오류가 발생했습니다");
    } finally {
      setIsRoleChanging(false);
    }
  };

  /**
   * 멤버 제거 다이얼로그 열기
   */
  const handleRemoveClick = (member: GroupMemberWithProfile) => {
    setMemberToRemove(member);
  };

  /**
   * 멤버 제거 확인
   */
  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);

    try {
      const result = await removeMember(groupId, memberToRemove.id);

      if (result.success) {
        toast.success("멤버가 제거되었습니다");
        setMemberToRemove(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("멤버 제거 오류:", error);
      toast.error("멤버 제거 중 오류가 발생했습니다");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => (
          <MemberListItem
            key={member.id}
            member={member}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onRoleChange={handleRoleChange}
            onRemove={handleRemoveClick}
            isLoading={isRoleChanging || isRemoving}
          />
        ))}
      </div>

      {/* 멤버 제거 확인 다이얼로그 */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 제거</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.profile.full_name}님을 모임에서 제거하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "제거 중..." : "제거"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
