import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent } from "@/components/ui/card";

// 로딩 중 표시될 스켈레톤 UI
function LoginFormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
          </div>
          <div className="h-6 bg-muted rounded w-24 mx-auto" />
          <div className="h-4 bg-muted rounded w-48 mx-auto" />
          <div className="space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
          <div className="h-4 bg-muted rounded w-full" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* useSearchParams를 사용하는 LoginForm은 Suspense로 감싸야 함 */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
