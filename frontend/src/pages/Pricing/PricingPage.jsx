import Navbar from '../../components/layout/Navbar'
import PricingSection from '../../components/sections/Pricing/PricingSection'
import FooterSection from '../../components/sections/Footer/FooterSection'
import { pricingPageStyles as styles } from './PricingPage.styles'

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <PricingSection headingLevel="h1" />
      </main>
      <FooterSection revealContent={false} />
    </div>
  )
}
