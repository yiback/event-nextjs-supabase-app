// 푸시 구독 API Route
// POST: 새 구독 저장 (upsert)
// DELETE: 구독 삭제

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// 요청 바디 스키마
const subscribeSchema = z.object({
  endpoint: z.string().url("유효한 endpoint URL이 필요합니다"),
  keys: z.object({
    p256dh: z.string().min(1, "p256dh 키가 필요합니다"),
    auth: z.string().min(1, "auth 키가 필요합니다"),
  }),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url("유효한 endpoint URL이 필요합니다"),
});

/**
 * POST /api/push/subscribe
 * 푸시 구독 정보를 저장합니다 (upsert)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Supabase 클라이언트 생성 및 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 2. 요청 바디 파싱 및 검증
    const body = await request.json();
    const validationResult = subscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "잘못된 요청 형식입니다.",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { endpoint, keys } = validationResult.data;

    // 3. 구독 정보 저장 (upsert - endpoint 기준)
    const { data, error: upsertError } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        {
          onConflict: "endpoint", // endpoint가 같으면 업데이트
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("[API] 구독 저장 오류:", upsertError);
      return NextResponse.json(
        { error: "구독 정보를 저장하는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("[API] 구독 저장 성공:", { userId: user.id, endpoint });

    return NextResponse.json({
      success: true,
      message: "푸시 알림 구독이 활성화되었습니다.",
      subscription: {
        id: data.id,
        endpoint: data.endpoint,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error("[API] 구독 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * 푸시 구독을 삭제합니다
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Supabase 클라이언트 생성 및 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 2. 요청 바디 파싱 및 검증
    const body = await request.json();
    const validationResult = unsubscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "잘못된 요청 형식입니다.",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { endpoint } = validationResult.data;

    // 3. 구독 정보 삭제 (user_id와 endpoint 모두 일치해야 삭제)
    const { error: deleteError } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (deleteError) {
      console.error("[API] 구독 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "구독 정보를 삭제하는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("[API] 구독 삭제 성공:", { userId: user.id, endpoint });

    return NextResponse.json({
      success: true,
      message: "푸시 알림 구독이 해제되었습니다.",
    });
  } catch (error) {
    console.error("[API] 구독 삭제 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push/subscribe
 * 현재 사용자의 구독 상태 확인
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 사용자의 모든 구독 조회
    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, created_at")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("[API] 구독 조회 오류:", fetchError);
      return NextResponse.json(
        { error: "구독 정보를 조회하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || [],
      count: subscriptions?.length || 0,
    });
  } catch (error) {
    console.error("[API] 구독 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
