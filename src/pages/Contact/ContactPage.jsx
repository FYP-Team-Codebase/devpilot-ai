import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import Navbar from '../../components/layout/Navbar'
import FooterSection from '../../components/sections/Footer/FooterSection'
import useLandingNavigation from '../../hooks/useLandingNavigation'
import { contactPageStyles as styles } from './ContactPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=5%2F68%2C%20Usman%20Block%2C%20New%20Garden%20Town%2C%20Lahore%2054000%20SABAC%20School%20of%20Advance%20Business%20and%20Commerce'

const INQUIRY_TYPES = [
  'Product Question',
  'Business / Team',
  'Support',
  'Feedback',
  'General Inquiry',
]

const CREATORS = [
  'Ali Hamza',
  'Taha Shahzad',
  'Mubariz Elahi',
  'Haziq Naeem',
  'Abaid Ullah',
  'Nimra Khan',
]

const INITIAL_VALUES = {
  name: '',
  email: '',
  inquiryType: '',
  projectContext: '',
  message: '',
}

function softMotion(shouldReduceMotion, delay = 0) {
  return {
    initial: shouldReduceMotion ? false : { opacity: 1, y: 10 },
    whileInView: shouldReduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: shouldReduceMotion ? 0 : 0.46, ease: EASE, delay: shouldReduceMotion ? 0 : delay },
  }
}

export default function ContactPage() {
  const shouldReduceMotion = useReducedMotion()
  const { handleStartBuilding } = useLandingNavigation()

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <ContactHero shouldReduceMotion={shouldReduceMotion} />
        <ContactAndForm shouldReduceMotion={shouldReduceMotion} />
        <CreatorContext />
        <QuietFinalCta onStartBuilding={handleStartBuilding} />
      </main>
      <FooterSection revealContent={false} />
    </div>
  )
}

function ContactHero({ shouldReduceMotion }) {
  return (
    <section className={styles.hero} aria-labelledby="contact-hero-title">
      <motion.div
        className={styles.heroInner}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.68, ease: EASE }}
      >
        <div>
          <p className={styles.eyebrow}>CONTACT CODE NOVA</p>
          <h1 id="contact-hero-title" className={styles.heroTitle}>
            Let's talk about what you're building.
          </h1>
        </div>

        <aside className={styles.heroAside}>
          <p className={styles.heroCopy}>
            Reach out about DevPilot AI, product questions, business or team interest, feedback, and general enquiries.
          </p>
        </aside>
      </motion.div>

      <div className={`${styles.container} ${styles.heroRule}`}>
        <p className={styles.heroRuleText}>A quiet place for product questions, early business conversations, and useful feedback.</p>
      </div>
    </section>
  )
}

function ContactAndForm({ shouldReduceMotion }) {
  return (
    <section className={styles.contactSection} aria-labelledby="contact-details-title">
      <div className={styles.contactGrid}>
        <motion.div className={styles.infoIntro} {...softMotion(shouldReduceMotion)}>
          <p className={styles.sectionLabel}>Contact</p>
          <h2 id="contact-details-title" className={styles.sectionTitle}>
            Use the provided contact details, or prepare a message for the form connection.
          </h2>
          <p className={styles.sectionCopy}>
            The contact form is a frontend foundation while delivery is being connected. Phone and location details are available now.
          </p>

          <div className={styles.infoList} aria-label="Provided contact information">
            <motion.div className={styles.infoRow} {...softMotion(shouldReduceMotion, 0.04)}>
              <p className={styles.infoLabel}>Visit</p>
              <a
                className={styles.infoLink}
                href={MAP_URL}
                target="_blank"
                rel="noreferrer"
              >
                5/68, Usman Block, New Garden Town, Lahore 54000
              </a>
            </motion.div>

            <motion.div className={styles.infoRow} {...softMotion(shouldReduceMotion, 0.08)}>
              <p className={styles.infoLabel}>Call</p>
              <a className={styles.infoLink} href="tel:+924235844096">
                (042) 35844096
              </a>
            </motion.div>

            <motion.div className={styles.infoRow} {...softMotion(shouldReduceMotion, 0.12)}>
              <p className={styles.infoLabel}>Location</p>
              <p className={styles.infoValue}>SABAC School of Advance Business and Commerce</p>
              <p className={styles.infoText}>Affiliated with University of the Punjab</p>
            </motion.div>
          </div>
        </motion.div>

        <ContactForm shouldReduceMotion={shouldReduceMotion} />
      </div>
    </section>
  )
}

function ContactForm({ shouldReduceMotion }) {
  const formId = useId()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  function updateField(event) {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }

    if (status) {
      setStatus('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateContactForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus('')
      return
    }

    setStatus('Contact form delivery is being connected. You can currently reach us by phone using the contact details provided.')
  }

  return (
    <motion.section
      className={styles.formPanel}
      aria-labelledby="contact-form-title"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.58, ease: EASE, delay: shouldReduceMotion ? 0 : 0.08 }}
    >
      <div className={styles.formHeader}>
        <h2 id="contact-form-title" className={styles.formTitle}>Contact form</h2>
        <p className={styles.formCopy}>
          Fill this out to shape the message. Delivery is not connected yet, so submitting will not send data to a backend.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGrid}>
          <FormField
            id={`${formId}-name`}
            label="Name"
            name="name"
            value={values.name}
            error={errors.name}
            onChange={updateField}
            autoComplete="name"
          />
          <FormField
            id={`${formId}-email`}
            label="Email"
            name="email"
            type="email"
            value={values.email}
            error={errors.email}
            onChange={updateField}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${formId}-inquiry-type`}>Inquiry Type</label>
          <select
            id={`${formId}-inquiry-type`}
            name="inquiryType"
            className={styles.select}
            value={values.inquiryType}
            onChange={updateField}
            aria-invalid={errors.inquiryType ? 'true' : undefined}
            aria-describedby={errors.inquiryType ? `${formId}-inquiry-type-error` : undefined}
          >
            <option value="">Select inquiry type</option>
            {INQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.inquiryType && (
            <p id={`${formId}-inquiry-type-error`} className={styles.error}>{errors.inquiryType}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${formId}-project-context`}>Optional Project Context</label>
          <textarea
            id={`${formId}-project-context`}
            name="projectContext"
            className={styles.projectTextarea}
            value={values.projectContext}
            onChange={updateField}
            rows="3"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${formId}-message`}>Message</label>
          <textarea
            id={`${formId}-message`}
            name="message"
            className={styles.textarea}
            value={values.message}
            onChange={updateField}
            rows="5"
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          />
          {errors.message && (
            <p id={`${formId}-message-error`} className={styles.error}>{errors.message}</p>
          )}
        </div>

        {status && (
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
        )}

        <div className={styles.formActions}>
          <motion.button
            type="submit"
            className={styles.submitButton}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            Submit
          </motion.button>
          <a className={styles.secondaryLink} href="tel:+924235844096">
            Call instead
          </a>
        </div>
      </form>
    </motion.section>
  )
}

function FormField({ id, label, name, value, error, onChange, type = 'text', autoComplete }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        className={styles.input}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className={styles.error}>{error}</p>
      )}
    </div>
  )
}

function CreatorContext() {
  return (
    <section className={styles.contextSection} aria-labelledby="creator-context-title">
      <div className={styles.contextInner}>
        <div>
          <p className={styles.sectionLabel}>Project context</p>
          <h2 id="creator-context-title" className={styles.contextTitle}>
            DevPilot AI is being created by a six-member team under Code Nova.
          </h2>
        </div>
        <div>
          <p className={styles.sectionCopy}>
            This contact page stays focused on reaching Code Nova. Full team presentation can live separately on the About page.
          </p>
          <ul className={styles.creatorList} aria-label="DevPilot AI creators">
            {CREATORS.map((creator) => (
              <li key={creator} className={styles.creatorItem}>{creator}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function QuietFinalCta({ onStartBuilding }) {
  return (
    <section className={styles.finalSection} aria-labelledby="contact-final-title">
      <div className={styles.finalInner}>
        <div>
          <h2 id="contact-final-title" className={styles.finalTitle}>
            Want to see what we're building first?
          </h2>
          <p className={styles.finalCopy}>
            Explore DevPilot AI, or start the current project workflow from a prompt.
          </p>
        </div>
        <div className={styles.finalActions}>
          <Link to="/products" className={styles.finalSecondary}>
            Explore DevPilot
          </Link>
          <motion.a
            href="/prompt"
            className={styles.finalPrimary}
            onClick={onStartBuilding}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            Try DevPilot AI
          </motion.a>
        </div>
      </div>
    </section>
  )
}

function validateContactForm(values) {
  const nextErrors = {}
  const email = values.email.trim()

  if (!values.name.trim()) {
    nextErrors.name = 'Enter your name.'
  }

  if (!email) {
    nextErrors.email = 'Enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.email = 'Enter a valid email address.'
  }

  if (!values.inquiryType) {
    nextErrors.inquiryType = 'Choose an inquiry type.'
  }

  if (!values.message.trim()) {
    nextErrors.message = 'Enter a message.'
  }

  return nextErrors
}
