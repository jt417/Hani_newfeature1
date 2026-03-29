/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#440382',   // 브랜드 메인
          dark: '#360268',      // 진한 배경/호버
          deep: '#2A0150',      // 가장 어두운 톤
          light: '#6B3FA0',     // 밝은 보조
        },
        surface: {
          DEFAULT: '#F7F3FC',   // 기본 배경
          muted: '#EDE5F7',     // 카드/섹션 배경
          light: '#FAF7FD',     // 가장 밝은 배경
          line: '#E0D4EE',      // 구분선/보더
          soft: '#C9B5DE',      // 비활성 요소
          outline: '#B8A3CF',   // 아웃라인
          warm: '#F3EDE8',      // 따뜻한 뉘앙스 배경
        },
        accent: {
          iris: '#7B4FBF',      // 밝은 보라 (아이콘/버튼)
          lilac: '#A882D0',     // 연보라 (서브 액센트)
          rich: '#5A12A5',      // 진한 보라 (그라데이션 시작)
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { top: '0' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
};
