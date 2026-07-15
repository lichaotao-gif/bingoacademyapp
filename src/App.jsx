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
import Growth from './pages/Growth'
import GrowthTrajectory from './pages/GrowthTrajectory'
import GrowthPlanning from './pages/GrowthPlanning'
import ProfilePoints from './pages/ProfilePoints'
import Career from './pages/Career'
import EventOrganizer from './pages/EventOrganizer'
import EventGallery from './pages/EventGallery'
import EventAITest from './pages/EventAITest'
import EventWhitelist from './pages/EventWhitelist'
import EventBingguo from './pages/EventBingguo'
import Certification from './pages/Certification'
import Mall from './pages/Mall'
import MallCheckout from './pages/MallCheckout'
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
import FranchisePartnerDemoStartRedirect from './pages/franchise-portal/FranchisePartnerDemoStartRedirect'
import InstitutionHqNewOrgDemoLayout from './pages/institution-hq/InstitutionHqNewOrgDemoLayout'
import InstitutionHqOnboardingQualification from './pages/institution-hq/InstitutionHqOnboardingQualification'
import FranchisePartnerDashboard from './pages/franchise-portal/FranchisePartnerDashboard'
import FranchisePartnerPromote from './pages/franchise-portal/FranchisePartnerPromote'
import FranchisePartnerOrders from './pages/franchise-portal/FranchisePartnerOrders'
import FranchisePartnerFinance from './pages/franchise-portal/FranchisePartnerFinance'
import FranchisePartnerClasses from './pages/franchise-portal/FranchisePartnerClasses'
import FranchisePartnerClassDetail from './pages/franchise-portal/FranchisePartnerClassDetail'
import FranchisePartnerStudents from './pages/franchise-portal/FranchisePartnerStudents'
import FranchisePartnerProgress from './pages/franchise-portal/FranchisePartnerProgress'
import FranchisePartnerRecharge from './pages/franchise-portal/FranchisePartnerRecharge'
import FranchisePartnerDiscounts from './pages/franchise-portal/FranchisePartnerDiscounts'
import FranchisePartnerBalance from './pages/franchise-portal/FranchisePartnerBalance'
import FranchisePartnerSettings from './pages/franchise-portal/FranchisePartnerSettings'
import FranchisePartnerOrgApply from './pages/franchise-portal/FranchisePartnerOrgApply'
import FranchisePartnerStaffAccounts from './pages/franchise-portal/FranchisePartnerStaffAccounts'
import FranchisePartnerTeachingMaterials from './pages/franchise-portal/FranchisePartnerTeachingMaterials'
import FranchisePartnerTeachingMaterialDetail from './pages/franchise-portal/FranchisePartnerTeachingMaterialDetail'
import InstitutionHqLogin from './pages/institution-hq/InstitutionHqLogin'
import InstitutionHqLayout from './pages/institution-hq/InstitutionHqLayout'
import InstitutionHqDashboard from './pages/institution-hq/InstitutionHqDashboard'
import InstitutionHqFinance from './pages/institution-hq/InstitutionHqFinance'
import InstitutionHqSettings from './pages/institution-hq/InstitutionHqSettings'
import InstitutionHqCampusAccounts from './pages/institution-hq/InstitutionHqCampusAccounts'
import InstitutionHqStaffAccounts from './pages/institution-hq/InstitutionHqStaffAccounts'

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
        <Route path="/events" element={<EventWhitelist />} />
        <Route path="/events/:eventId" element={<EventWhitelist />} />
        <Route path="/events/organizer" element={<EventOrganizer />} />
        <Route path="/events/gallery" element={<EventGallery />} />
        <Route path="/events/ai-test" element={<EventAITest />} />
        <Route path="/events/whitelist" element={<Navigate to="/events" replace />} />
        <Route path="/events/whitelist/:eventId" element={<EventWhitelist />} />
        <Route path="/events/bingguo-ai" element={<EventBingguo />} />
        <Route path="/cert" element={<Certification />} />
        <Route path="/mall" element={<Mall />} />
        <Route path="/mall/checkout/:productId" element={<MallCheckout />} />
        <Route path="/mall/:productId" element={<Mall />} />
        <Route path="/mall/materials" element={<Materials />} />
        <Route path="/franchise" element={<Franchise />} />
        <Route path="/franchise-partner/login" element={<FranchisePartnerLogin />} />
        <Route path="/franchise-partner/demo-new-org/start" element={<Navigate to="/institution-hq/demo-new-org/start" replace />} />
        <Route path="/franchise-partner/demo-new-org/*" element={<Navigate to="/institution-hq/demo-new-org" replace />} />
        <Route path="/institution-hq/demo-new-org/start" element={<FranchisePartnerDemoStartRedirect />} />
        <Route path="/institution-hq/demo-new-org" element={<InstitutionHqNewOrgDemoLayout />}>
          <Route index element={<Navigate to="onboarding/apply" replace />} />
          <Route path="onboarding/apply" element={<FranchisePartnerOrgApply />} />
          <Route path="onboarding/qualification" element={<InstitutionHqOnboardingQualification />} />
          <Route path="dashboard" element={<InstitutionHqDashboard />} />
          <Route path="finance" element={<InstitutionHqFinance />} />
          <Route path="settings" element={<InstitutionHqSettings />} />
          <Route path="campus-accounts" element={<InstitutionHqCampusAccounts />} />
          <Route path="hq-staff-accounts" element={<InstitutionHqStaffAccounts />} />
        </Route>
        <Route path="/institution-hq/login" element={<InstitutionHqLogin />} />
        <Route path="/institution-hq" element={<InstitutionHqLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstitutionHqDashboard />} />
          <Route path="finance" element={<InstitutionHqFinance />} />
          <Route path="settings" element={<InstitutionHqSettings />} />
          <Route path="campus-accounts" element={<InstitutionHqCampusAccounts />} />
          <Route path="hq-staff-accounts" element={<InstitutionHqStaffAccounts />} />
        </Route>
        <Route path="/franchise-partner" element={<FranchisePartnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FranchisePartnerDashboard />} />
          <Route path="promote" element={<FranchisePartnerPromote />} />
          <Route path="orders" element={<FranchisePartnerOrders />} />
          <Route path="finance" element={<FranchisePartnerFinance />} />
          <Route path="recharge" element={<FranchisePartnerRecharge />} />
          <Route path="teaching-materials/item/:productId" element={<FranchisePartnerTeachingMaterialDetail />} />
          <Route path="teaching-materials" element={<FranchisePartnerTeachingMaterials />} />
          <Route path="discounts" element={<FranchisePartnerDiscounts />} />
          <Route path="balance" element={<FranchisePartnerBalance />} />
          <Route path="settings" element={<FranchisePartnerSettings />} />
          <Route path="staff-accounts" element={<FranchisePartnerStaffAccounts />} />
          <Route path="classes/:classId" element={<FranchisePartnerClassDetail />} />
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
        <Route path="/growth" element={<Growth />} />
        <Route path="/growth/planning" element={<GrowthPlanning />} />
        <Route path="/growth/trajectory" element={<GrowthTrajectory />} />
        <Route path="/charity" element={<Navigate to="/showcase#honor" replace />} />
      </Routes>
    </Layout>
  )
}
