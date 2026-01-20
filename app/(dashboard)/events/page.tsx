// 내 이벤트 페이지
// 사용자가 참여 중인 모든 이벤트 목록
export default function MyEventsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">내 이벤트</h1>
      <p className="text-muted-foreground mt-2">
        참여 중인 이벤트 목록입니다.
      </p>
      {/* TODO: 이벤트 카드 목록, 필터 (예정/지난 이벤트) 구현 */}
    </div>
  );
}
