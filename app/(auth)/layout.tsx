// (auth) 라우트 그룹 레이아웃
// 로그인/회원가입 등 인증 관련 페이지용 심플 레이아웃
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
