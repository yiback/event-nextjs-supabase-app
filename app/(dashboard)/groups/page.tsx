// 모임 목록 페이지
// 사용자가 가입한 모임 목록 표시
export default function GroupsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">내 모임</h1>
      <p className="text-muted-foreground mt-2">
        가입한 모임 목록입니다.
      </p>
      {/* TODO: 모임 카드 그리드, 모임 생성 버튼 구현 */}
    </div>
  );
}
