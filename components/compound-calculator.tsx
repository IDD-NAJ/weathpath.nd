"use client"

import { useState, useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { DollarSign, TrendingUp, Calendar, PiggyBank } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

export function CompoundCalculator() {
  const [initial, setInitial] = useState(5000)
  const [monthly, setMonthly] = useState(300)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(15)

  const result = useMemo(() => {
    const r = rate / 100 / 12
    const n = years * 12
    const futureValue =
      initial * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r)
    const totalContributed = initial + monthly * n
    const interestEarned = futureValue - totalContributed
    return {
      futureValue: Math.round(futureValue),
      totalContributed: Math.round(totalContributed),
      interestEarned: Math.round(interestEarned),
    }
  }, [initial, monthly, rate, years])

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const interestPercent =
    result.futureValue > 0
      ? Math.round((result.interestEarned / result.futureValue) * 100)
      : 0
  const contributedPercent = 100 - interestPercent

  return (
    <section id="tools" className="scroll-mt-20 border-y border-border bg-card px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Interactive Tools
          </p>
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
            See how your money can grow over time
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Adjust the sliders below to visualize the power of consistent
            contributions and compound growth.
          </p>
        </AnimatedSection>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Controls */}
          <div className="flex flex-col gap-8 rounded-xl border border-border bg-background p-6 md:p-8">
            {/* Starting Amount */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Starting Amount
                </label>
                <span className="text-sm font-semibold text-foreground">
                  {fmt(initial)}
                </span>
              </div>
              <Slider
                min={0}
                max={100000}
                step={500}
                value={[initial]}
                onValueChange={([v]) => setInitial(v)}
                aria-label="Starting amount"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$100,000</span>
              </div>
            </div>

            {/* Monthly Contribution */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <PiggyBank className="h-4 w-4 text-primary" />
                  Monthly Contribution
                </label>
                <span className="text-sm font-semibold text-foreground">
                  {fmt(monthly)}
                </span>
              </div>
              <Slider
                min={0}
                max={5000}
                step={50}
                value={[monthly]}
                onValueChange={([v]) => setMonthly(v)}
                aria-label="Monthly contribution"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* Annual Return */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Expected Annual Return
                </label>
                <span className="text-sm font-semibold text-foreground">
                  {rate}%
                </span>
              </div>
              <Slider
                min={1}
                max={15}
                step={0.5}
                value={[rate]}
                onValueChange={([v]) => setRate(v)}
                aria-label="Expected annual return"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Time Horizon */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Time Horizon
                </label>
                <span className="text-sm font-semibold text-foreground">
                  {years} years
                </span>
              </div>
              <Slider
                min={1}
                max={40}
                step={1}
                value={[years]}
                onValueChange={([v]) => setYears(v)}
                aria-label="Time horizon in years"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>1 yr</span>
                <span>40 yrs</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-6">
            {/* Total card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Projected Total
              </p>
              <p className="font-serif text-4xl font-normal text-foreground md:text-5xl">
                {fmt(result.futureValue)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                after {years} {years === 1 ? "year" : "years"} of growth
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  You Contribute
                </p>
                <p className="text-xl font-bold text-foreground">
                  {fmt(result.totalContributed)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Growth Earned
                </p>
                <p className="text-xl font-bold text-primary">
                  {fmt(result.interestEarned)}
                </p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Contribution vs. Growth
              </p>
              <div className="flex h-6 overflow-hidden rounded-full">
                <div
                  className="bg-foreground/20 transition-all duration-500"
                  style={{ width: `${contributedPercent}%` }}
                  aria-label={`Contributions: ${contributedPercent}%`}
                />
                <div
                  className="bg-primary transition-all duration-500"
                  style={{ width: `${interestPercent}%` }}
                  aria-label={`Growth: ${interestPercent}%`}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground/20" />
                  Contributions ({contributedPercent}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                  Growth ({interestPercent}%)
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              This calculator is for educational purposes only. Actual returns
              will vary based on market conditions, fees, and other factors.
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
