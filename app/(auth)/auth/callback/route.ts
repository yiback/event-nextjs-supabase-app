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
      // OAuth 인증 후 프로필 생성 안전장치
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        // Google OAuth의 user_metadata에서 프로필 정보 추출
        // Google은 name, picture 필드를 제공함
        const fullName = user.user_metadata.name || user.user_metadata.full_name || null;
        const avatarUrl = user.user_metadata.picture || user.user_metadata.avatar_url || null;

        if (!profile) {
          // 프로필이 없으면 새로 생성
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
          });
        } else if (!profile.full_name || !profile.avatar_url) {
          // 프로필은 있지만 full_name이나 avatar_url이 NULL이면 업데이트
          await supabase
            .from('profiles')
            .update({
              full_name: fullName || profile.full_name,
              avatar_url: avatarUrl || profile.avatar_url,
            })
            .eq('id', user.id);
        }
      }

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
