import { FC, useState, useEffect } from "react"

interface WorkflowsEditorProps {
  workflowId: string
}

// Minimal paragraph block config for Editor.js
const editorConfig = {
  holder: "editorjs-paragraph",
  tools: {
    paragraph: {
      class: require("@editorjs/paragraph"),
      inlineToolbar: true
    }
  },
  data: {
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "Start your workflow description here..."
        }
      }
    ]
  }
}

export const WorkflowsEditor: FC<WorkflowsEditorProps> = ({ workflowId }) => {
  const [editor, setEditor] = useState<any>(null)

  useEffect(() => {
    let editorInstance: any = null
    let isMounted = true
    if (typeof window !== "undefined" && !editor) {
      // Remove any previous editorjs content to prevent duplicates
      const holder = document.getElementById("editorjs-paragraph")
      if (holder) holder.innerHTML = ""

      Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/paragraph")
      ]).then(([EditorJSModule, ParagraphModule]) => {
        // Use only the default export for Paragraph (for type compatibility)
        const Paragraph = ParagraphModule.default
        editorInstance = new EditorJSModule.default({
          holder: "editorjs-paragraph",
          tools: {
            paragraph: {
              class: Paragraph,
              inlineToolbar: true
            }
          },
          data: {
            blocks: [
              {
                type: "paragraph",
                data: {
                  text: "Start your workflow description here..."
                }
              }
            ]
          }
        })
        if (isMounted) setEditor(editorInstance)
      })
    }
    return () => {
      isMounted = false
      if (editorInstance && editorInstance.destroy) {
        editorInstance.destroy()
      }
      // Clean up the editor container to prevent duplicate editors
      const holder = document.getElementById("editorjs-paragraph")
      if (holder) holder.innerHTML = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="size-full p-4">
      <div
        id="editorjs-paragraph"
        className="bg-background min-h-[200px] rounded border"
      />
    </div>
  )
}
