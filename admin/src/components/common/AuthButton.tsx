import { hasPerm } from '@/utils/auth'

interface AuthButtonProps {
  permCode: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/** 按钮级权限控制：无权限时隐藏或渲染 fallback */
export default function AuthButton({ permCode, children, fallback = null }: AuthButtonProps) {
  if (!hasPerm(permCode)) return <>{fallback}</>
  return <>{children}</>
}
