import { Link, Navigate, useParams } from 'react-router-dom'
import CourseFinalExamBlock from '../components/CourseFinalExamBlock'
import { MY_COURSES } from './Study'

/**
 * 课程结业整体考评独立页（卡片式全流程，与课时列表入口分离）
 */
export default function StudyCourseFinalExam() {
  const { courseId } = useParams()
  const course = MY_COURSES.find((c) => c.id === courseId)

  if (!course) {
    return <Navigate to="/profile/study" replace />
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/profile/study" className="text-sm text-slate-500 hover:text-primary">
          ← 学习中心
        </Link>
      </div>
      <CourseFinalExamBlock courseTitle={course.title} />
    </div>
  )
}
