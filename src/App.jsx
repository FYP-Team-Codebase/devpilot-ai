import Navbar from './components/layout/Navbar'
import HeroSection from './components/sections/Hero/HeroSection'
import TechBar from './components/sections/TechBar/TechBar'
import MobileShowcase from './components/sections/MobileShowcase/MobileShowcase'
import WorkflowSection from './components/sections/Workflow/WorkflowSection'
import PricingSection from './components/sections/Pricing/PricingSection'
import FinalCtaSection from './components/sections/FinalCta/FinalCtaSection'
import FooterSection from './components/sections/Footer/FooterSection'
import ScrollHandoff from './components/motion/ScrollHandoff'
import LoginPage from './pages/Login/LoginPage'
import SignupPage from './pages/Signup/SignupPage'
import VerifyEmailPage from './pages/VerifyEmail/VerifyEmailPage'
import './App.css'

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'

  if (path === '/login') return <LoginPage />
  if (path === '/signup') return <SignupPage />
  if (path === '/verify-email') return <VerifyEmailPage />

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

export default App
