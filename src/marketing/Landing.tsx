import { Hero } from './components/Hero'
import { FeatureTeasers } from './components/FeatureTeasers'

/** Marketing-Startseite (/) — Hero + scroll-getriebene Feature-Sektion. */
export function Landing() {
  return (
    <>
      <Hero />
      <FeatureTeasers />
    </>
  )
}
