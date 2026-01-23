'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { KakaoIcon, GoogleIcon } from '@/components/icons/social-icons';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

/**
 * 소셜 로그인 제공자 타입
 */
export type SocialProvider = 'kakao' | 'google';

/**
 * 소셜 로그인 버튼 컴포넌트 Props
 */
export interface SocialLoginButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 소셜 로그인 제공자 */
  provider: SocialProvider;
  /** 로그인 후 리디렉션할 경로 (기본값: /dashboard) */
  redirectTo?: string;
  /** 버튼 클릭 핸들러 (선택적) */
  onClick?: () => void;
}

/**
 * 제공자별 버튼 설정
 */
const providerConfig: Record<
  SocialProvider,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    className: string;
  }
> = {
  kakao: {
    icon: KakaoIcon,
    label: '카카오로 계속하기',
    className:
      'bg-[#FEE500] text-[#000000D9] hover:bg-[#FEE500]/90 border-0',
  },
  google: {
    icon: GoogleIcon,
    label: 'Google로 계속하기',
    className: 'border border-input bg-background hover:bg-accent',
  },
};

/**
 * 소셜 로그인 버튼 컴포넌트
 *
 * 카카오 또는 구글 소셜 로그인을 위한 버튼 UI
 * 현재는 UI만 구현되어 있으며, 실제 OAuth 인증 로직은 추후 구현 예정
 *
 * @example
 * ```tsx
 * <SocialLoginButton provider="kakao" onClick={() => console.log('카카오 로그인')} />
 * <SocialLoginButton provider="google" onClick={() => console.log('구글 로그인')} />
 * ```
 */
export const SocialLoginButton = React.forwardRef<
  HTMLButtonElement,
  SocialLoginButtonProps
>(({ provider, redirectTo = '/dashboard', onClick, className, disabled, ...props }, ref) => {
  const config = providerConfig[provider];
  const Icon = config.icon;
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 버튼 클릭 핸들러
   * Google OAuth 인증 또는 카카오 로그인 처리
   */
  const handleClick = async () => {
    if (provider === 'google') {
      // Google OAuth 인증 처리
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            // Google OAuth에서 프로필 정보 요청
            scopes: 'email profile',
          },
        });

        if (error) {
          console.error('Google OAuth 에러:', error);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Google 로그인 중 예외 발생:', error);
        setIsLoading(false);
      }
    } else {
      // 카카오 로그인 (추후 구현)
      console.log(`${provider} 로그인 버튼 클릭됨`);
      onClick?.();
    }
  };

  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      className={cn(
        'w-full h-12 text-sm font-medium',
        config.className,
        className
      )}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      <Icon className="h-5 w-5 mr-2" />
      {config.label}
    </Button>
  );
});

SocialLoginButton.displayName = 'SocialLoginButton';
