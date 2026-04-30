import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from '@/utils/request'
import BasicLayout from '@/layouts/BasicLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import SystemAdmin from '@/pages/System/Admin'
import StudentList from '@/pages/Student/List'
import CourseList from '@/pages/Course/List'
import CourseCategory from '@/pages/Course/Category'
import CourseChapter from '@/pages/Course/Chapter'
import CourseConfig from '@/pages/Course/Config'
import CourseEdit from '@/pages/Course/Edit'
import CompetitionApply from '@/pages/Competition/Apply'
import CompetitionList from '@/pages/Competition/List'
import CompetitionDetail from '@/pages/Competition/Detail'
import MallOrder from '@/pages/Mall/Order'
import MallProduct from '@/pages/Mall/Product'
import MallPackage from '@/pages/Mall/Package'
import AiResource from '@/pages/AiResource'
import MarketingActivityList from '@/pages/Marketing/Activity'
import MarketingActivityCreate from '@/pages/Marketing/Activity/Create'
import MarketingActivityDetail from '@/pages/Marketing/Activity/Detail'
import SystemRole from '@/pages/System/Role'
import AITestOverview from '@/pages/AITest/Overview'
import ContentPageList from '@/pages/Content/Page'
import ContentBannerList from '@/pages/Content/Banner'
import FinanceSettlement from '@/pages/Finance/Settlement'
import SystemLog from '@/pages/System/Log'
import StatisticsReport from '@/pages/Statistics/Report'
import FranchisePartnerList from '@/pages/Franchise/List'
import FranchiseQualification from '@/pages/Franchise/Qualification'
import FranchisePartnerDetailPage from '@/pages/Franchise/Detail'
import FranchiseTeachingProducts from '@/pages/Franchise/TeachingProducts'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <BasicLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/statistics/overview" replace />} />
          <Route path="statistics/overview" element={<Dashboard />} />
          <Route path="statistics/report" element={<StatisticsReport />} />
          <Route path="system/admin" element={<SystemAdmin />} />
          <Route path="system/role" element={<SystemRole />} />
          <Route path="system/log" element={<SystemLog />} />
          <Route path="student/list" element={<StudentList />} />
          <Route path="course/list" element={<CourseList />} />
          <Route path="course/category" element={<CourseCategory />} />
          <Route path="course/config" element={<CourseConfig />} />
          <Route path="course/edit" element={<CourseEdit />} />
          <Route path="course/chapter" element={<CourseChapter />} />
          <Route path="competition/list" element={<CompetitionList />} />
          <Route path="competition/detail" element={<CompetitionDetail />} />
          <Route path="competition/apply" element={<CompetitionApply />} />
          <Route path="ai-resource/list" element={<AiResource />} />
          <Route path="mall/product" element={<MallProduct />} />
          <Route path="mall/order" element={<MallOrder />} />
          <Route path="mall/package" element={<MallPackage />} />
          <Route path="marketing/activity" element={<MarketingActivityList />} />
          <Route path="marketing/activity/create" element={<MarketingActivityCreate />} />
          <Route path="marketing/activity/detail" element={<MarketingActivityDetail />} />
          <Route path="aitest/overview" element={<AITestOverview />} />
          <Route path="content/page" element={<ContentPageList />} />
          <Route path="content/banner" element={<ContentBannerList />} />
          <Route path="finance/settlement" element={<FinanceSettlement />} />
          <Route path="franchise/list" element={<FranchisePartnerList />} />
          <Route path="franchise/qualification" element={<FranchiseQualification />} />
          <Route path="franchise/detail" element={<FranchisePartnerDetailPage />} />
          <Route path="franchise/teaching-products" element={<FranchiseTeachingProducts />} />
          <Route path="cooperation/list" element={<Navigate to="/franchise/list" replace />} />
          <Route path="cooperation/settlement" element={<Navigate to="/finance/settlement" replace />} />
          <Route path="*" element={<div style={{ padding: 24 }}>功能开发中</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
