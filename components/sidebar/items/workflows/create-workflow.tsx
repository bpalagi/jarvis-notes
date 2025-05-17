import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { COLLECTION_DESCRIPTION_MAX, COLLECTION_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"

interface CreateWorkflowProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateWorkflow: FC<CreateWorkflowProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("{}")

  if (!profile || !selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="workflows"
      createState={
        {
          user_id: profile.user_id,
          name,
          description,
          content: (() => {
            try {
              console.log("Parsing content JSON:", content)
              return content ? JSON.parse(content) : {}
            } catch (e) {
              console.error("JSON parse error:", e)
              return {}
            }
          })()
        } as TablesInsert<"workflows">
      }
      isOpen={isOpen}
      isTyping={isTyping}
      onOpenChange={onOpenChange}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Workflow name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={COLLECTION_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="Workflow description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={COLLECTION_DESCRIPTION_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Content</Label>

            <TextareaAutosize
              placeholder="Workflow content (JSON)..."
              value={content}
              onValueChange={value => {
                setContent(value)
                setIsTyping(true)
                try {
                  // Validate JSON
                  JSON.parse(value)
                } catch (error) {
                  // Invalid JSON - you could add error state here
                }
                setIsTyping(false)
              }}
              minRows={5}
              className="font-mono text-sm"
            />
          </div>
        </>
      )}
    />
  )
}
