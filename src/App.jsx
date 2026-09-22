import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import HeroSection from './components/sections/Hero/HeroSection'
import TechBar from './components/sections/TechBar/TechBar'
import MobileShowcase from './components/sections/MobileShowcase/MobileShowcase'
import WorkflowSection from './components/sections/Workflow/WorkflowSection'
import PricingSection from './components/sections/Pricing/PricingSection'
import FinalCtaSection from './components/sections/FinalCta/FinalCtaSection'
import FooterSection from './components/sections/Footer/FooterSection'
import ScrollHandoff from './components/motion/ScrollHandoff'
import { getCurrentUser, getToken } from './services/authService'
import { getSectionIdFromHash, scrollToLandingSection } from './utils/landingScroll'
import useDocumentTitle from './hooks/useDocumentTitle'
import { getDocumentTitle } from './utils/documentTitle'

const LoginPage = lazy(() => import('./pages/Login/LoginPage'))
const SignupPage = lazy(() => import('./pages/Signup/SignupPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail/VerifyEmailPage'))
const PromptPage = lazy(() => import('./pages/Prompt/PromptPage'))
const RequirementsPage = lazy(() => import('./pages/Requirements/RequirementsPage'))
const GenerationPage = lazy(() => import('./pages/Generation/GenerationPage'))
const AboutPage = lazy(() => import('./pages/About/AboutPage'))
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'))
const BusinessPage = lazy(() => import('./pages/Business/BusinessPage'))
const PricingPage = lazy(() => import('./pages/Pricing/PricingPage'))
const ContactPage = lazy(() => import('./pages/Contact/ContactPage'))

const loadDashboardModule = () => import('./pages/Dashboard/DashboardPage')
const DashboardPage = lazy(loadDashboardModule)
const DashboardHome = lazy(() => loadDashboardModule().then((module) => ({ default: module.DashboardHome })))
const ProjectsPage = lazy(() => loadDashboardModule().then((module) => ({ default: module.ProjectsPage })))
const MyAssetsPage = lazy(() => loadDashboardModule().then((module) => ({ default: module.MyAssetsPage })))
const StandaloneInspirationPage = lazy(() => loadDashboardModule().then((module) => ({ default: module.StandaloneInspirationPage })))
const GenerationInspirationPage = lazy(() => loadDashboardModule().then((module) => ({ default: module.GenerationInspirationPage })))
const DashboardPricingPage = lazy(() => loadDashboardModule().then((module) => ({ default: module.PricingPage })))
const SettingsPage = lazy(() => loadDashboardModule().then((module) => ({ default: module.SettingsPage })))
const ProfilePage = lazy(() => loadDashboardModule().then((module) => ({ default: module.ProfilePage })))

function RouteLoader() {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      Loading page...
    </div>
  )
}

function ProtectedRoute({ children }) {
  const location = useLocation()
  const token = getToken()
  const user = getCurrentUser()
  const isAuthenticated = Boolean(token && user)

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return children(user)
}

function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    const sectionId = getSectionIdFromHash(location.hash)

    if (!sectionId) {
      return undefined
    }

    const scrollTimer = window.setTimeout(() => {
      scrollToLandingSection(sectionId)
    }, 0)

    return () => window.clearTimeout(scrollTimer)
  }, [location.hash])

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ScrollHandoff>
          <TechBar />
        </ScrollHandoff>
        <ScrollHandoff>
          <MobileShowcase />
        </ScrollHandoff>
        <ScrollHandoff>
          <WorkflowSection />
        </ScrollHandoff>
        <ScrollHandoff>
          <PricingSection />
        </ScrollHandoff>
        <ScrollHandoff tone="dark">
          <FinalCtaSection />
        </ScrollHandoff>
        <ScrollHandoff>
          <FooterSection />
        </ScrollHandoff>
      </main>
    </>
  )
}

function DocumentTitleManager() {
  const location = useLocation()
  const [projectTitleVersion, setProjectTitleVersion] = useState(0)

  useEffect(() => {
    function updateProjectTitle() {
      setProjectTitleVersion((version) => version + 1)
    }

    window.addEventListener('storage', updateProjectTitle)
    window.addEventListener('devpilot-requirements-changed', updateProjectTitle)

    return () => {
      window.removeEventListener('storage', updateProjectTitle)
      window.removeEventListener('devpilot-requirements-changed', updateProjectTitle)
    }
  }, [])

  useDocumentTitle(getDocumentTitle(location.pathname, projectTitleVersion))

  return null
}

function App() {
  return (
    <BrowserRouter>
      <DocumentTitleManager />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/prompt"
            element={
              <ProtectedRoute>
                {() => <PromptPage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/requirements"
            element={
              <ProtectedRoute>
                {() => <RequirementsPage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspiration"
            element={
              <ProtectedRoute>
                {(user) => <DashboardPage user={user} content={<GenerationInspirationPage />} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/generation"
            element={
              <ProtectedRoute>
                {(user) => <DashboardPage user={user} content={<GenerationPage />} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {(user) => <DashboardPage user={user} />}
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="assets" element={<MyAssetsPage />} />
            <Route path="inspiration" element={<StandaloneInspirationPage />} />
            <Route path="generate/inspiration" element={<Navigate to="/inspiration" replace />} />
            <Route path="pricing" element={<DashboardPricingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="templates" element={<Navigate to="/dashboard/assets" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
