"use client";

import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { mockEvents, mockGroups, getParticipantsForEvent } from "@/lib/mock/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FeaturePreview 컴포넌트
 * 랜딩 페이지에서 서비스 주요 기능을 미리보기로 보여주는 섹션
 */
export function FeaturePreview() {
  // 미리보기에 사용할 샘플 데이터 선택
  const sampleEvent = mockEvents[1]; // "수영 PT 세션"
  const sampleGroup = mockGroups[0]; // "주말 수영 모임"
  const sampleParticipants = getParticipantsForEvent(sampleEvent.id);

  // 참석 현황 집계
  const attendanceStats = {
    attending: sampleParticipants.filter((p) => p.status === "attending").length,
    notAttending: sampleParticipants.filter((p) => p.status === "not_attending").length,
    maybe: sampleParticipants.filter((p) => p.status === "maybe").length,
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 애니메이션 설정
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 mx-auto">
        {/* 섹션 제목 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            이렇게 사용해요
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            모임 관리의 모든 과정을 간편하게 경험해보세요
          </p>
        </motion.div>

        {/* 미리보기 카드 그리드 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {/* 1. 이벤트 카드 미리보기 */}
          <motion.div variants={itemVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">이벤트 카드</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  이벤트 정보를 한눈에 확인
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 이벤트 제목 */}
                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      {sampleEvent.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(sampleEvent.event_date)}
                    </p>
                  </div>

                  {/* 참석 현황 */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      참석 현황
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{attendanceStats.attending}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{attendanceStats.notAttending}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">{attendanceStats.maybe}</span>
                      </div>
                    </div>
                  </div>

                  {/* 상태 배지 */}
                  <div className="flex gap-2">
                    <Badge variant="new" className="text-xs">
                      예정
                    </Badge>
                    <Badge variant="deadlineSoon" className="text-xs">
                      마감 임박
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. 참석 응답 버튼 미리보기 */}
          <motion.div variants={itemVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">참석 응답</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  클릭 한 번으로 응답 완료
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 설명 텍스트 */}
                  <p className="text-sm text-muted-foreground">
                    참석 여부를 간편하게 선택하세요
                  </p>

                  {/* 응답 버튼 그룹 */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start gap-2",
                        "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
                        "text-emerald-700 hover:text-emerald-800"
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      참석할게요
                    </Button>

                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start gap-2",
                        "border-red-200 hover:bg-red-50",
                        "text-red-700 hover:text-red-800"
                      )}
                    >
                      <XCircle className="h-4 w-4" />
                      불참할게요
                    </Button>

                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start gap-2",
                        "border-amber-200 hover:bg-amber-50",
                        "text-amber-700 hover:text-amber-800"
                      )}
                    >
                      <HelpCircle className="h-4 w-4" />
                      미정이에요
                    </Button>
                  </div>

                  {/* 안내 텍스트 */}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    언제든지 응답을 변경할 수 있어요
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. 모임 카드 미리보기 */}
          <motion.div variants={itemVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">모임 관리</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  모임 정보와 멤버 현황
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 모임 정보 */}
                  <div>
                    <h3 className="font-semibold text-base mb-2">
                      {sampleGroup.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sampleGroup.description}
                    </p>
                  </div>

                  {/* 멤버 수 */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">멤버</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">5</span>
                    </div>
                  </div>

                  {/* 초대 코드 */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      초대 코드
                    </p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono font-semibold text-primary">
                        {sampleGroup.invite_code}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        복사
                      </Badge>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      활성화
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      소유자
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
