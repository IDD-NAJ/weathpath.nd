"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AnimatedSection } from "@/components/animated-section"

interface Question {
  question: string
  options: { label: string; value: string }[]
}

const questions: Question[] = [
  {
    question: "How would you describe your current knowledge of passive income?",
    options: [
      { label: "Brand new to the concept", value: "beginner" },
      { label: "I understand the basics", value: "intermediate" },
      { label: "I have some experience already", value: "advanced" },
    ],
  },
  {
    question: "How much time can you dedicate to learning and building each week?",
    options: [
      { label: "A couple of hours", value: "low" },
      { label: "Five to ten hours", value: "medium" },
      { label: "More than ten hours", value: "high" },
    ],
  },
  {
    question: "What appeals to you most?",
    options: [
      { label: "Earning from property or real assets", value: "real-estate" },
      { label: "Growing money through investing", value: "investing" },
      { label: "Building an online product or business", value: "digital" },
      { label: "I am open to exploring all options", value: "all" },
    ],
  },
  {
    question: "What is your comfort level with risk?",
    options: [
      { label: "I prefer safe, slow growth", value: "conservative" },
      { label: "Some risk for better returns is fine", value: "moderate" },
      { label: "I am comfortable taking calculated risks", value: "aggressive" },
    ],
  },
  {
    question: "What is your primary goal?",
    options: [
      { label: "Supplement my current income", value: "supplement" },
      { label: "Replace my full-time income over time", value: "replace" },
      { label: "Build long-term wealth for retirement", value: "retirement" },
    ],
  },
]

interface Recommendation {
  title: string
  description: string
  paths: string[]
}

function getRecommendation(answers: string[]): Recommendation {
  const interest = answers[2]
  const risk = answers[3]

  if (interest === "real-estate") {
    return {
      title: "Real Estate & Tangible Assets",
      description:
        "Based on your answers, you are drawn to real-world assets. Start with our Real Estate Income path, then explore Risk Management to protect your investments.",
      paths: ["Real Estate Income", "Risk Management", "Interest & Lending"],
    }
  }
  if (interest === "investing") {
    return {
      title: "Investment-Focused Growth",
      description:
        "You are interested in letting money work for you through markets and funds. Begin with Dividend Investing and layer in Interest & Lending for diversification.",
      paths: ["Dividend Investing", "Interest & Lending", "Risk Management"],
    }
  }
  if (interest === "digital") {
    return {
      title: "Digital & Online Income",
      description:
        "You are excited about building something online. Start with Digital Products, then explore Online Business Models to scale your efforts.",
      paths: ["Digital Products", "Online Business Models", "Risk Management"],
    }
  }

  // "all" or fallback
  if (risk === "conservative") {
    return {
      title: "Steady & Diversified Approach",
      description:
        "You prefer stability and want to explore broadly. Start with Interest & Lending for low-risk foundations, then branch into Dividend Investing.",
      paths: ["Interest & Lending", "Dividend Investing", "Real Estate Income"],
    }
  }

  return {
    title: "Balanced Explorer",
    description:
      "You are open-minded and ready to learn across multiple strategies. We recommend starting with the fundamentals of each major path.",
    paths: ["Dividend Investing", "Digital Products", "Real Estate Income", "Risk Management"],
  }
}

export function IncomeQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const progress = showResult
    ? 100
    : ((currentStep) / questions.length) * 100

  function handleNext() {
    if (selectedOption === null) return
    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResult(true)
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      const newAnswers = answers.slice(0, -1)
      setAnswers(newAnswers)
      setSelectedOption(null)
      setCurrentStep(currentStep - 1)
    }
  }

  function handleReset() {
    setCurrentStep(0)
    setAnswers([])
    setSelectedOption(null)
    setShowResult(false)
  }

  const recommendation = showResult ? getRecommendation(answers) : null

  return (
    <section id="quiz" className="scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <AnimatedSection className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Interactive Quiz
          </p>
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Find your ideal starting point
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Answer five quick questions and receive a personalized recommendation
            for which learning paths suit you best.
          </p>
        </AnimatedSection>

        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <Progress value={progress} className="mb-8 h-1.5" />

          {!showResult ? (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Question {currentStep + 1} of {questions.length}
              </p>
              <h3 className="mb-6 text-lg font-semibold text-foreground">
                {questions[currentStep].question}
              </h3>

              <div className="flex flex-col gap-3">
                {questions[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOption(option.value)}
                    className={`flex items-center rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-all ${
                      selectedOption === option.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selectedOption === option.value
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedOption === option.value && (
                        <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedOption === null}
                  className="gap-1"
                >
                  {currentStep === questions.length - 1 ? "See Results" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            recommendation && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {recommendation.title}
                </h3>
                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                  {recommendation.description}
                </p>

                <div className="mb-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Recommended Paths
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recommendation.paths.map((path) => (
                      <span
                        key={path}
                        className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-foreground"
                      >
                        {path}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button asChild>
                    <a href="#learn">Start Learning</a>
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="gap-1">
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
