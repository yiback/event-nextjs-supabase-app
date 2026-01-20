// 랜딩 페이지 (메인 페이지)

import Link from "next/link";
import { Calendar, Users, Bell, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

// 주요 기능 카드 정의
const features = [
  {
    icon: Users,
    title: "모임 관리",
    description: "그룹을 만들고 멤버를 초대하여 효율적으로 관리하세요.",
  },
  {
    icon: Calendar,
    title: "이벤트 생성",
    description: "정기/비정기 이벤트를 쉽게 생성하고 일정을 공유하세요.",
  },
  {
    icon: CheckCircle,
    title: "참석 관리",
    description: "참석 여부를 간편하게 확인하고 통계를 관리하세요.",
  },
  {
    icon: Bell,
    title: "알림 기능",
    description: "이벤트 알림과 공지사항을 놓치지 않고 받아보세요.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          모임의 모든 이벤트를
          <br />
          <span className="text-primary">한곳에서</span> 관리하세요
        </h1>
        <p className="text-muted-foreground mt-6 text-lg max-w-2xl">
          소규모 모임의 이벤트 참석 관리와 공지를 효율적으로 처리하세요.
          <br className="hidden sm:block" />
          간단한 초대 링크로 멤버를 모으고, 참석 여부를 한눈에 확인하세요.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">무료로 시작하기</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">로그인</Link>
          </Button>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col items-center p-6 bg-background rounded-lg border text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 px-4">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            복잡한 설정 없이 1분 만에 모임을 만들고
            <br />
            멤버들과 함께 이벤트를 관리해보세요.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">무료로 시작하기</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
