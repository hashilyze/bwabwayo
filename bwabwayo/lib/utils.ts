import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 배포 환경에서 basePath를 고려한 정적 파일 경로 반환
export function getStaticPath(path: string): string {
  if (process.env.NODE_ENV === 'production') {
    return `/fe${path}`
  }
  return path
} 