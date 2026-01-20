// 대시보드 홈 페이지
// 사용자의 예정된 이벤트, 최근 활동 요약 표시
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <p className="text-muted-foreground mt-2">
        예정된 이벤트와 최근 활동을 확인하세요.
      </p>
      {/* TODO: 예정된 이벤트 목록, 최근 활동 카드 구현 */}
    </div>
  );
}
