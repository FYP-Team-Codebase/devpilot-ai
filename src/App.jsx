import Navbar from './components/layout/Navbar'
import HeroSection from './components/sections/Hero/HeroSection'
import TechBar from './components/sections/TechBar/TechBar'
import WorkflowSection from './components/sections/Workflow/WorkflowSection'
import PricingSection from './components/sections/Pricing/PricingSection'
import FinalCtaSection from './components/sections/FinalCta/FinalCtaSection'
import FooterSection from './components/sections/Footer/FooterSection'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TechBar />
        <WorkflowSection />
        <PricingSection />
        <FinalCtaSection />
        <FooterSection />
      </main>
    </>
  )
}

export default App
