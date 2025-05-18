import { FC, useEffect, useRef } from "react"

interface WorkflowsEditorProps {
  workflowId: string
}

const WorkflowsEditor: FC<WorkflowsEditorProps> = ({ workflowId }) => {
  const editorRef = useRef<any>(null)

  useEffect(() => {
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
        data: {
          blocks: [
            {
              type: "paragraph",
              data: { text: "Store workflow content here..." }
            }
          ]
        }
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
  }, [])

  return <div id="editorjs-paragraph" className="min-h-[200px]" />
}

export default WorkflowsEditor
