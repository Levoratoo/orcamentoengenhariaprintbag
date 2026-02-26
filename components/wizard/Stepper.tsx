"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  currentStep: number
  totalSteps: number
  steps: string[]
  highestStep?: number // Etapa mais alta já alcançada
  onStepClick?: (step: number) => void
}

export function Stepper({ currentStep, totalSteps, steps, highestStep, onStepClick }: StepperProps) {
  // Usar highestStep se disponível, senão usar currentStep
  const maxReachedStep = highestStep ?? currentStep
  
  const canNavigateTo = (stepNumber: number) => {
    // Pode navegar para qualquer etapa já visitada
    return stepNumber <= maxReachedStep
  }
  
  const isVisited = (stepNumber: number) => {
    // Considera visitada se já passou por ela
    return stepNumber <= maxReachedStep
  }

  return (
    <div className="w-full py-4">
      {/* Linha dos círculos */}
      <div className="relative">
        {/* Linha de fundo */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-800 -translate-y-1/2" />
        
        {/* Linha de progresso - mostra até a etapa mais alta já alcançada */}
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-[#27a75c] -translate-y-1/2 transition-all duration-500"
          style={{ 
            width: `${((maxReachedStep - 1) / (steps.length - 1)) * 100}%` 
          }}
        />

        {/* Círculos */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = isVisited(stepNumber) && stepNumber !== currentStep // Visitada mas não é a atual
            const canClick = canNavigateTo(stepNumber)

            return (
              <button
                key={stepNumber}
                type="button"
                onClick={() => canClick && onStepClick?.(stepNumber)}
                disabled={!canClick}
                className={cn(
                  "group relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold transition-all duration-300 ease-out",
                  // Estados base - visitadas ficam verdes
                  isActive && "bg-[#27a75c] text-white",
                  isCompleted && "bg-[#27a75c] text-white",
                  !isActive && !isCompleted && "bg-gray-900 text-gray-500 border-2 border-gray-700",
                  // Efeitos de hover para etapas acessíveis
                  canClick && "cursor-pointer",
                  canClick && "hover:scale-[1.3] hover:shadow-[0_0_25px_rgba(39,167,92,0.7)] hover:-translate-y-1",
                  canClick && isCompleted && "hover:bg-[#2cb866]",
                  canClick && isActive && "hover:bg-[#2cb866]",
                  // Etapa atual
                  isActive && "scale-110 shadow-[0_0_20px_rgba(39,167,92,0.5)]",
                  // Etapas não acessíveis
                  !canClick && "cursor-not-allowed opacity-50 hover:scale-100"
                )}
              >
                {/* Glow effect no hover */}
                <span className={cn(
                  "absolute inset-0 rounded-full transition-opacity duration-300 opacity-0",
                  canClick && "group-hover:opacity-100",
                  "bg-[#27a75c]/20 blur-md"
                )} />
                
                {/* Conteúdo */}
                <span className="relative z-10">
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    stepNumber
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = isVisited(stepNumber) && stepNumber !== currentStep
          const canClick = canNavigateTo(stepNumber)

          return (
            <button
              key={stepNumber}
              type="button"
              onClick={() => canClick && onStepClick?.(stepNumber)}
              disabled={!canClick}
              className={cn(
                "text-[11px] text-center leading-tight w-[70px] -ml-[15px] first:ml-0 last:mr-0 transition-all duration-200",
                isActive && "font-semibold text-white",
                isCompleted && "text-[#27a75c]",
                !isActive && !isCompleted && "text-gray-500",
                canClick && "cursor-pointer hover:text-[#2cb866]",
                !canClick && "cursor-not-allowed"
              )}
            >
              {step}
            </button>
          )
        })}
      </div>
    </div>
  )
}







