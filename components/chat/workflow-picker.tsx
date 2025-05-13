import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { useWorkflowAndCommand } from "./chat-hooks/use-workflow-and-command"

interface WorkflowPickerProps {}

export const WorkflowPicker: FC<WorkflowPickerProps> = ({}) => {
  const {
    workflows,
    isWorkflowPickerOpen,
    setIsWorkflowPickerOpen,
    focusWorkflow,
    slashCommand
  } = useContext(ChatbotUIContext)

  const { handleSelectWorkflow } = useWorkflowAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const [workflowVariables, setWorkflowVariables] = useState<
    {
      workflowId: string
      name: string
      value: string
    }[]
  >([])
  const [showWorkflowVariables, setShowWorkflowVariables] = useState(false)

  useEffect(() => {
    if (focusWorkflow && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusWorkflow])

  const [isTyping, setIsTyping] = useState(false)

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(slashCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsWorkflowPickerOpen(isOpen)
  }

  const callSelectWorkflow = (workflow: Tables<"workflows">) => {
    const regex = /\{\{.*?\}\}/g
    const matches = workflow.content.match(regex)

    if (matches) {
      const newWorkflowVariables = matches.map(match => ({
        workflowId: workflow.id,
        name: match.replace(/\{\{|\}\}/g, ""),
        value: ""
      }))

      setWorkflowVariables(newWorkflowVariables)
      setShowWorkflowVariables(true)
    } else {
      handleSelectWorkflow(workflow)
      handleOpenChange(false)
    }
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectWorkflow(filteredWorkflows[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredWorkflows.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }

  const handleSubmitWorkflowVariables = () => {
    const newWorkflowContent = workflowVariables.reduce(
      (prevContent, variable) =>
        prevContent.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, "g"),
          variable.value
        ),
      workflows.find(
        workflow => workflow.id === workflowVariables[0].workflowId
      )?.content || ""
    )

    const newWorkflow: any = {
      ...workflows.find(
        workflow => workflow.id === workflowVariables[0].workflowId
      ),
      content: newWorkflowContent
    }

    handleSelectWorkflow(newWorkflow)
    handleOpenChange(false)
    setShowWorkflowVariables(false)
    setWorkflowVariables([])
  }

  const handleCancelWorkflowVariables = () => {
    setShowWorkflowVariables(false)
    setWorkflowVariables([])
  }

  const handleKeydownWorkflowVariables = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitWorkflowVariables()
    }
  }

  return (
    <>
      {isWorkflowPickerOpen && (
        <div className="bg-background flex flex-col space-y-1 rounded-xl border-2 p-2 text-sm">
          {showWorkflowVariables ? (
            <Dialog
              open={showWorkflowVariables}
              onOpenChange={setShowWorkflowVariables}
            >
              <DialogContent onKeyDown={handleKeydownWorkflowVariables}>
                <DialogHeader>
                  <DialogTitle>Enter Workflow Variables</DialogTitle>
                </DialogHeader>

                <div className="mt-2 space-y-6">
                  {workflowVariables.map((variable, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <Label>{variable.name}</Label>

                      <TextareaAutosize
                        placeholder={`Enter a value for ${variable.name}...`}
                        value={variable.value}
                        onValueChange={value => {
                          const newWorkflowVariables = [...workflowVariables]
                          newWorkflowVariables[index].value = value
                          setWorkflowVariables(newWorkflowVariables)
                        }}
                        minRows={3}
                        maxRows={5}
                        onCompositionStart={() => setIsTyping(true)}
                        onCompositionEnd={() => setIsTyping(false)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelWorkflowVariables}
                  >
                    Cancel
                  </Button>

                  <Button size="sm" onClick={handleSubmitWorkflowVariables}>
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              No matching workflows.
            </div>
          ) : (
            filteredWorkflows.map((workflow, index) => (
              <div
                key={workflow.id}
                ref={ref => {
                  itemsRef.current[index] = ref
                }}
                tabIndex={0}
                className="hover:bg-accent focus:bg-accent flex cursor-pointer flex-col rounded p-2 focus:outline-none"
                onClick={() => callSelectWorkflow(workflow)}
                onKeyDown={getKeyDownHandler(index)}
              >
                <div className="font-bold">{workflow.name}</div>

                <div className="truncate text-sm opacity-80">
                  {workflow.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
