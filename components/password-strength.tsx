"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const rules = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw: string) => /\d/.test(pw) },
  { label: "One special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
]

function getStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "" }
  const passed = rules.filter((r) => r.test(password)).length
  if (passed <= 1) return { score: 20, label: "Very weak", color: "bg-destructive" }
  if (passed === 2) return { score: 40, label: "Weak", color: "bg-orange-500" }
  if (passed === 3) return { score: 60, label: "Fair", color: "bg-amber-500" }
  if (passed === 4) return { score: 80, label: "Strong", color: "bg-primary/80" }
  return { score: 100, label: "Very strong", color: "bg-primary" }
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = useMemo(() => getStrength(password), [password])
  const results = useMemo(
    () => rules.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  )

  if (!password) return null

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "text-xs font-medium",
              score >= 80 ? "text-primary" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-destructive"
            )}
          >
            {label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i <= score / 20 ? color : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-1" role="list" aria-label="Password requirements">
        {results.map((r) => (
          <li
            key={r.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors duration-200",
              r.passed ? "text-primary" : "text-muted-foreground"
            )}
          >
            {r.passed ? (
              <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3 shrink-0" aria-hidden="true" />
            )}
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
