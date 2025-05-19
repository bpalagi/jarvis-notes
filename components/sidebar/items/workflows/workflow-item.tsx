import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { COLLECTION_DESCRIPTION_MAX, COLLECTION_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { IconPencil } from "@tabler/icons-react"
import { FC, useState, useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { SidebarItem } from "../all/sidebar-display-item"

interface WorkflowItemProps {
  workflow: Tables<"workflows">
}

export const WorkflowItem: FC<WorkflowItemProps> = ({ workflow }) => {
  const { selectedWorkflow, setSelectedWorkflow } = useContext(ChatbotUIContext)
  const [name, setName] = useState(workflow.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(workflow.description)
  const [content, setContent] = useState(
    workflow.content ? JSON.stringify(workflow.content) : "{}"
  )

  const isSelected = selectedWorkflow?.id === workflow.id

  return (
    <div
      className={isSelected ? "bg-accent" : ""}
      onClick={() => setSelectedWorkflow(workflow)}
    >
      <SidebarItem
        item={workflow}
        isTyping={isTyping}
        contentType="workflows"
        icon={<IconPencil size={30} />}
        updateState={{
          name,
          description,
          content: content ? JSON.parse(content) : {}
        }}
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
                    // Handle JSON parsing error if needed
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
    </div>
  )
}
