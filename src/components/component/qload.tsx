import React from "react"

export function Qload() {
  const [loadingStep, setLoadingStep] = React.useState(0)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prevStep) => (prevStep + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  const loadingSteps = [
    "Generating questions...",
    "Verifying questions...",
    "Creating explanations...",
    "Finalizing output...",
  ]
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative h-64 w-64">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-dashed" />
          <div className="absolute inset-0 animate-ping rounded-full opacity-75" />
          <div className="absolute inset-0 animate-pulse rounded-full" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-primary">{loadingSteps[loadingStep]}</h2>
          <p className="text-muted-foreground">
            "The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt
          </p>
        </div>
      </div>
    </div>
  )
}