'use client';

import { Check } from 'lucide-react';

interface WizardStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-xl mx-auto py-6">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <button
              onClick={() => isCompleted && onStepClick?.(i)}
              disabled={isFuture}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full
                text-sm font-bold transition-all duration-300 flex-shrink-0
                ${isCompleted
                  ? 'bg-green-50 text-green-600 border-2 border-green-400 cursor-pointer hover:bg-green-100'
                  : isActive
                    ? 'bg-cyan-50 text-nfv-cyan border-2 border-nfv-cyan shadow-nfv animate-nfv-glow-pulse'
                    : 'bg-[#f5f8fb] text-nfv-ice-muted border-2 border-[#d0dbe6]'
                }
              `}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
            </button>

            {/* Step label (below) */}
            <div className="absolute mt-14 -ml-4">
              <span className={`text-[11px] whitespace-nowrap ${isActive ? 'text-nfv-cyan font-medium' : isCompleted ? 'text-nfv-success' : 'text-nfv-ice-muted'}`}>
                {step}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-gradient-to-r from-nfv-success to-nfv-cyan' : 'bg-[#d0dbe6]'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
