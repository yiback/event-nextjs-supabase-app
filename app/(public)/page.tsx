// 랜딩 페이지 (메인 페이지)
"use client";

import Link from "next/link";
import { Calendar, Users, Bell, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { FeaturePreview } from "@/components/landing/feature-preview";

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

// 애니메이션 variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <motion.section
        className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="whitespace-nowrap">모임의 모든 이벤트를</span>
          <br />
          <span className="text-primary whitespace-nowrap">한곳에서</span>{" "}
          <span className="whitespace-nowrap">관리하세요</span>
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
      </motion.section>

      {/* 기능 소개 섹션 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            주요 기능
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="flex items-start gap-4 p-6 bg-background rounded-lg border"
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 기능 미리보기 섹션 */}
      <FeaturePreview />

      {/* CTA 섹션 */}
      <motion.section
        className="py-16 px-4"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
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
      </motion.section>
    </div>
  );
}
