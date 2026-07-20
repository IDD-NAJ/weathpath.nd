'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface SignupProgressProps {
  currentStep: number
  totalSteps?: number
  steps?: string[]
}

export function SignupProgress({
  currentStep,
  totalSteps = 3,
  steps = ['Email', 'Details', 'Interests'],
}: SignupProgressProps) {
  return (
    <div className="mb-8 animate-fade-down">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep

            return (
              <React.Fragment key={index}>
                {/* Step circle */}
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 transform
                    ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground scale-100'
                        : isActive
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 scale-110'
                          : 'bg-border text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check size={20} className="animate-scale-in" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Connector line */}
                {index < totalSteps - 1 && (
                  <div
                    className={`
                      flex-1 h-1 rounded-full transition-all duration-500
                      ${
                        isCompleted || (stepNumber === totalSteps - 1 && isActive)
                          ? 'bg-primary'
                          : 'bg-border'
                      }
                    `}
                    style={{
                      opacity: isCompleted || (stepNumber === totalSteps - 1 && isActive) ? 1 : 0.3,
                    }}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step labels */}
        <div className="flex justify-between mt-4 gap-2">
          {steps.map((step, index) => (
            <div key={index} className="flex-1">
              <p
                className={`
                  text-xs font-medium transition-colors duration-300
                  ${
                    index + 1 <= currentStep
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }
                `}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />
    </div>
  )
}
