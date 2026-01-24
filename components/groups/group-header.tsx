// 모임 헤더 컴포넌트
// 모임 상세 페이지 상단에 표시되는 모임 정보

import Image from "next/image";
import { Users } from "lucide-react";
import type { Group } from "@/types/database";

interface GroupHeaderProps {
  group: Group;
  memberCount: number;
}

export function GroupHeader({ group, memberCount }: GroupHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 모임 이미지 */}
      <div className="relative h-48 md:h-64 w-full rounded-xl overflow-hidden bg-muted">
        {group.image_url ? (
          <Image
            src={group.image_url}
            alt={group.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* 모임 정보 */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>

        {group.description && (
          <p className="text-muted-foreground">{group.description}</p>
        )}

        {/* 멤버 수 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>멤버 {memberCount}명</span>
        </div>
      </div>
    </div>
  );
}
