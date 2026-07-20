'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  success?: boolean
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  icon?: React.ReactNode
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required,
  disabled,
  autoComplete,
  icon,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="mb-5 animate-fade-up">
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-300
            text-foreground bg-background/50 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-500/30 focus:border-red-500'
                : success
                  ? 'border-green-500/30 focus:border-green-500'
                  : isFocused
                    ? 'border-primary/50 focus:border-primary'
                    : 'border-border/50 hover:border-border'
            }
          `}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Success indicator */}
        {success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <CheckCircle2 size={20} />
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle size={20} />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-fade-up">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && (
        <p className="mt-1 text-sm text-green-500 flex items-center gap-1 animate-fade-up">
          <CheckCircle2 size={14} />
          Looks good!
        </p>
      )}
    </div>
  )
}
