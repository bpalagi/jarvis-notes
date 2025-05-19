import { FC, useEffect, useRef, useState } from "react"
import { getWorkflowById, updateWorkflow } from "@/db/workflows"

interface WorkflowsEditorProps {
  workflowId: string
}

const WorkflowsEditor: FC<WorkflowsEditorProps> = ({ workflowId }) => {
  const editorRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [initialData, setInitialData] = useState<any>(null)

  // Load workflow content from DB
  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    getWorkflowById(workflowId)
      .then(workflow => {
        if (!mounted) return
        setInitialData(
          workflow.content || {
            blocks: [{ type: "paragraph", data: { text: "Start editing..." } }]
          }
        )
      })
      .finally(() => setIsLoading(false))
    return () => {
      mounted = false
    }
  }, [workflowId])

  // Initialize EditorJS
  useEffect(() => {
    if (!initialData) return
    let editor: any
    let mounted = true
    const loadEditor = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default
      const Paragraph = (await import("@editorjs/paragraph")).default
      if (!mounted) return
      editor = new EditorJS({
        holder: "editorjs-paragraph",
        tools: {
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true,
            config: {}
          }
        },
        data: initialData,
        async onChange(api) {
          if (!editor) return
          const data = await editor.save()
          setIsSaving(true)
          await updateWorkflow(workflowId, { content: data })
          setIsSaving(false)
        },
        autofocus: true
      })
      editorRef.current = editor
    }
    loadEditor()
    return () => {
      mounted = false
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy()
      }
      const holder = document.getElementById("editorjs-paragraph")
      if (holder) holder.innerHTML = ""
    }
  }, [initialData, workflowId])

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-10 text-lg">
        Loading workflow...
      </div>
    )
  }

  return (
    <div className="relative">
      {isSaving && (
        <div className="text-muted-foreground absolute right-4 top-2 text-xs">
          Saving...
        </div>
      )}
      <div
        id="editorjs-paragraph"
        className="min-h-screen overflow-auto p-10"
      />
    </div>
  )
}

export default WorkflowsEditor
