import React from 'react';

/**
 * 소셜 아이콘 컴포넌트의 Props 인터페이스
 */
export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * 카카오톡 아이콘 컴포넌트
 * 카카오 브랜드 가이드라인 준수 (#FEE500 배경, #191919 텍스트)
 */
export const KakaoIcon = React.forwardRef<SVGSVGElement, SocialIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        {/* 카카오톡 말풍선 로고 */}
        <path
          d="M12 3C6.477 3 2 6.477 2 10.8C2 13.542 3.729 15.942 6.387 17.316L5.256 21.159C5.179 21.429 5.463 21.654 5.703 21.495L10.305 18.498C10.861 18.579 11.426 18.621 12 18.621C17.523 18.621 22 15.144 22 10.821C22 6.498 17.523 3 12 3Z"
          fill="currentColor"
        />
      </svg>
    );
  }
);
KakaoIcon.displayName = 'KakaoIcon';

/**
 * 구글 아이콘 컴포넌트
 * Google Material Design 스타일 준수
 * 멀티컬러 G 로고 (#4285F4, #34A853, #FBBC05, #EA4335)
 */
export const GoogleIcon = React.forwardRef<SVGSVGElement, SocialIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        {/* 구글 G 로고 - 멀티컬러 버전 */}
        <path
          d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
          fill="#4285F4"
        />
        <path
          d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.71 16.7 5.84 14.1H2.18V16.94C3.99 20.53 7.7 23 12 23Z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.1C5.62 13.44 5.49 12.73 5.49 12C5.49 11.27 5.62 10.56 5.84 9.9V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.1Z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.13 5.38 12 5.38Z"
          fill="#EA4335"
        />
      </svg>
    );
  }
);
GoogleIcon.displayName = 'GoogleIcon';
