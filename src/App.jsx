import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

function AdminRedirect() {
  useEffect(() => {
    window.location.replace(window.location.pathname + window.location.search + window.location.hash)
  }, [])
  return <div style={{ padding: 48, textAlign: 'center' }}>跳转中...</div>
}
import Layout from './components/Layout'
import Home from './pages/Home'
import Showcase from './pages/Showcase'
import ShowcaseCase from './pages/ShowcaseCase'
import ShowcaseWorks from './pages/ShowcaseWorks'
import ShowcaseAwards from './pages/ShowcaseAwards'
import ShowcaseSchool from './pages/ShowcaseSchool'
import ShowcaseMaterials from './pages/ShowcaseMaterials'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import CourseCheckout from './pages/CourseCheckout'
import CoursePayment from './pages/CoursePayment'
import CourseSuccess from './pages/CourseSuccess'
import Community from './pages/Community'
import Tools from './pages/Tools'
import ToolDetail from './pages/ToolDetail'
import Research from './pages/Research'
import ResearchDetail from './pages/ResearchDetail'
import ResearchRegister from './pages/ResearchRegister'
import ResearchCheckout from './pages/ResearchCheckout'
import ResearchPayment from './pages/ResearchPayment'
import ResearchSuccess from './pages/ResearchSuccess'
import ProfileOrders from './pages/ProfileOrders'
import OrderVoucher from './pages/OrderVoucher'
import ProfileTest from './pages/ProfileTest'
import ProfilePoints from './pages/ProfilePoints'
import Career from './pages/Career'
import Events from './pages/Events'
import EventOrganizer from './pages/EventOrganizer'
import EventGallery from './pages/EventGallery'
import EventAITest from './pages/EventAITest'
import EventWhitelist from './pages/EventWhitelist'
import EventBingguo from './pages/EventBingguo'
import Certification from './pages/Certification'
import Mall from './pages/Mall'
import Franchise from './pages/Franchise'
import Materials from './pages/Materials'
import Study from './pages/Study'
import StudyCourseFinalExam from './pages/StudyCourseFinalExam'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import ProfileWorks from './pages/ProfileWorks'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import FranchisePartnerLogin from './pages/franchise-portal/FranchisePartnerLogin'
import FranchisePartnerLayout from './pages/franchise-portal/FranchisePartnerLayout'
import FranchisePartnerDashboard from './pages/franchise-portal/FranchisePartnerDashboard'
import FranchisePartnerPromote from './pages/franchise-portal/FranchisePartnerPromote'
import FranchisePartnerOrders from './pages/franchise-portal/FranchisePartnerOrders'
import FranchisePartnerFinance from './pages/franchise-portal/FranchisePartnerFinance'
import FranchisePartnerClasses from './pages/franchise-portal/FranchisePartnerClasses'
import FranchisePartnerStudents from './pages/franchise-portal/FranchisePartnerStudents'
import FranchisePartnerProgress from './pages/franchise-portal/FranchisePartnerProgress'
import FranchisePartnerRecharge from './pages/franchise-portal/FranchisePartnerRecharge'
import FranchisePartnerDiscounts from './pages/franchise-portal/FranchisePartnerDiscounts'
import FranchisePartnerBalance from './pages/franchise-portal/FranchisePartnerBalance'
import FranchisePartnerSettings from './pages/franchise-portal/FranchisePartnerSettings'
import FranchisePartnerTeachingMaterials from './pages/franchise-portal/FranchisePartnerTeachingMaterials'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/admin/*" element={<AdminRedirect />} />
        <Route path="/" element={<Home />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/showcase/works" element={<ShowcaseWorks />} />
        <Route path="/showcase/awards" element={<ShowcaseAwards />} />
        <Route path="/showcase/school" element={<ShowcaseSchool />} />
        <Route path="/showcase/materials" element={<ShowcaseMaterials />} />
        <Route path="/showcase/venture/:id" element={<ShowcaseCase />} />
        <Route path="/showcase/award/:id" element={<ShowcaseCase />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/detail/:id" element={<CourseDetail />} />
        <Route path="/courses/checkout" element={<CourseCheckout />} />
        <Route path="/courses/payment" element={<CoursePayment />} />
        <Route path="/courses/success" element={<CourseSuccess />} />
        <Route path="/community" element={<Community />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/detail/:id" element={<ToolDetail />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/detail/:id" element={<ResearchDetail />} />
        <Route path="/research/register/:id" element={<ResearchRegister />} />
        <Route path="/research/checkout" element={<ResearchCheckout />} />
        <Route path="/research/payment" element={<ResearchPayment />} />
        <Route path="/research/success" element={<ResearchSuccess />} />
        <Route path="/profile/orders" element={<ProfileOrders />} />
        <Route path="/profile/orders/:id/voucher" element={<OrderVoucher />} />
        <Route path="/profile/test" element={<ProfileTest />} />
        <Route path="/profile/points" element={<ProfilePoints />} />
        <Route path="/career" element={<Career />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/organizer" element={<EventOrganizer />} />
        <Route path="/events/gallery" element={<EventGallery />} />
        <Route path="/events/ai-test" element={<EventAITest />} />
        <Route path="/events/whitelist" element={<EventWhitelist />} />
        <Route path="/events/bingguo-ai" element={<EventBingguo />} />
        <Route path="/cert" element={<Certification />} />
        <Route path="/mall" element={<Mall />} />
        <Route path="/mall/materials" element={<Materials />} />
        <Route path="/franchise" element={<Franchise />} />
        <Route path="/franchise-partner/login" element={<FranchisePartnerLogin />} />
        <Route path="/franchise-partner" element={<FranchisePartnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FranchisePartnerDashboard />} />
          <Route path="promote" element={<FranchisePartnerPromote />} />
          <Route path="orders" element={<FranchisePartnerOrders />} />
          <Route path="finance" element={<FranchisePartnerFinance />} />
          <Route path="recharge" element={<FranchisePartnerRecharge />} />
          <Route path="teaching-materials" element={<FranchisePartnerTeachingMaterials />} />
          <Route path="discounts" element={<FranchisePartnerDiscounts />} />
          <Route path="balance" element={<FranchisePartnerBalance />} />
          <Route path="settings" element={<FranchisePartnerSettings />} />
          <Route path="classes" element={<FranchisePartnerClasses />} />
          <Route path="students" element={<FranchisePartnerStudents />} />
          <Route path="progress" element={<FranchisePartnerProgress />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/profile/study" element={<Study />} />
        <Route path="/profile/study/exam/:courseId" element={<StudyCourseFinalExam />} />
        <Route path="/study" element={<Study />} />
        <Route path="/study/exam/:courseId" element={<StudyCourseFinalExam />} />
        <Route path="/profile/works" element={<ProfileWorks />} />
        <Route path="/login" element={<Navigate to="/" state={{ openLogin: true }} replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* 旧路由重定向，保持兼容 */}
        <Route path="/growth" element={<Navigate to="/courses#growth-plan" replace />} />
        <Route path="/charity" element={<Navigate to="/showcase#honor" replace />} />
      </Routes>
    </Layout>
  )
}
