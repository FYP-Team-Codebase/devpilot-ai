import Navbar from './components/layout/Navbar'
import HeroSection from './components/sections/Hero/HeroSection'
import TechBar from './components/sections/TechBar/TechBar'
import WorkflowSection from './components/sections/Workflow/WorkflowSection'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TechBar />
        <WorkflowSection />
        <div className="page-placeholder">
          <p>More Code Nova sections coming soon.</p>
        </div>
      </main>
    </>
  )
}

export default App
