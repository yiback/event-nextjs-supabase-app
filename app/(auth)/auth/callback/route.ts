import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * OAuth 및 이메일 인증 콜백 처리
 * Supabase에서 인증 후 code 파라미터와 함께 리다이렉트됨
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 인증 후 리다이렉트할 경로 (기본값: /dashboard)
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 인증 성공 - 지정된 경로로 리다이렉트
      return NextResponse.redirect(`${origin}${next}`);
    }

    // 인증 실패 - 에러 페이지로 리다이렉트
    console.error("OAuth 콜백 에러:", error.message);
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`
    );
  }

  // code가 없는 경우 에러 페이지로 리다이렉트
  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent("인증 코드가 없습니다")}`
  );
}
