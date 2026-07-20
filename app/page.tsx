import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { LearningPaths } from "@/components/learning-paths"
import { IncomeQuiz } from "@/components/income-quiz"
import { CompoundCalculator } from "@/components/compound-calculator"
import { CourseStoreSection } from "@/components/course-store-section"
import { StatisticsSection } from "@/components/statistics-section"
import { SuccessStories } from "@/components/success-stories"
import { FAQSection } from "@/components/faq-section"
import { CommunityFeed } from "@/components/community-feed"
import { ResourcesSection } from "@/components/resources-section"
import { StepGuide } from "@/components/step-guide"
import { DonateSectionWrapper } from "@/components/donate-section-wrapper"
import { CtaFooter } from "@/components/cta-footer"

export const dynamic = 'force-dynamic'

export default async function Page() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LearningPaths />
        <IncomeQuiz />
        <CompoundCalculator />
        <CourseStoreSection />
        <StatisticsSection />
        <SuccessStories />
        <FAQSection />
        <CommunityFeed />
        <ResourcesSection />
        <StepGuide />
        <DonateSectionWrapper />
        <CtaFooter />
      </main>
    </div>
  )
}
