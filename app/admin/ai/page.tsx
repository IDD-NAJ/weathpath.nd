import { AIContentGenerator } from "@/components/admin/ai-content-generator"

export default function AIPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          AI Content Generation
        </h2>
        <p className="text-sm text-muted-foreground">
          Generate articles, stories, learning paths, and quizzes using AI
        </p>
      </div>
      <AIContentGenerator />
    </div>
  )
}
