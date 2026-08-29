"use client"

import { Button } from "@chatbotx.io/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@chatbotx.io/ui/components/ui/dialog"
import { Textarea } from "@chatbotx.io/ui/components/ui/textarea"
import { useReactFlow } from "@xyflow/react"
import { BotIcon, Loader2Icon, SparklesIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { generateFlowWithAiAction } from "../actions/generate-flow-ai.action"

const PRESET_PROMPTS = [
  "WhatsApp lead capture flow requesting name, email, and phone number",
  "E-commerce order status inquiry bot with automated tracking lookups",
  "Appointment booking assistant flow with calendar availability check",
]

type GenerateFlowAiDialogProps = {
  workspaceId: string
  trigger?: React.ReactNode
  onGenerated?: (nodes: any[], edges: any[]) => void
}

export function GenerateFlowAiDialog({
  workspaceId,
  trigger,
  onGenerated,
}: GenerateFlowAiDialogProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const { setNodes, setEdges } = useReactFlow()

  const generateAction = useAction(generateFlowWithAiAction.bind(null, workspaceId), {
    onSuccess: ({ data }) => {
      if (data?.nodes && data?.edges) {
        if (onGenerated) {
          onGenerated(data.nodes, data.edges)
        } else {
          setNodes(data.nodes)
          setEdges(data.edges)
        }
        toast.success("Flow generated successfully with Gemini AI!")
        setOpen(false)
        setPrompt("")
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to generate flow with AI")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    generateAction.execute({ prompt: prompt.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10">
            <SparklesIcon className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Generate with AI</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <SparklesIcon className="h-5 w-5 text-amber-500" />
              Build Workflow with Gemini AI
            </DialogTitle>
            <DialogDescription>
              Instruct Gemini to design a complete chatbot flow for your use case.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="e.g. Create a WhatsApp lead generation flow that asks for the customer's name, email, and preferred appointment time..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <BotIcon className="h-3.5 w-3.5" /> Quick Preset Prompts:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-xs rounded-md bg-secondary/80 hover:bg-secondary px-2.5 py-1 text-secondary-foreground text-left transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={generateAction.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!prompt.trim() || generateAction.isPending}
              className="gap-2 bg-gradient-to-r from-amber-500 to-primary text-white"
            >
              {generateAction.isPending ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Generating Flow...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate Flow
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
