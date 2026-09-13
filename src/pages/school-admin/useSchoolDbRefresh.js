import { useEffect, useState } from 'react'
import { SCHOOL_DB_EVENT } from '../../utils/schoolAdminStorage'

/**
 * 学校端数据写入后强制重渲染当前页，使各页读到的都是最新 localStorage 快照。
 * 返回值用于需要显式声明依赖的场景（如 useMemo）。
 */
export default function useSchoolDbRefresh() {
  const [rev, setRev] = useState(0)
  useEffect(() => {
    const bump = () => setRev((n) => n + 1)
    window.addEventListener(SCHOOL_DB_EVENT, bump)
    return () => window.removeEventListener(SCHOOL_DB_EVENT, bump)
  }, [])
  return rev
}
