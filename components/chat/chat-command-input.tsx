import { ChatbotUIContext } from "@/context/context"
import { FC, useContext } from "react"
import { AssistantPicker } from "./assistant-picker"
import { useWorkflowAndCommand } from "./chat-hooks/use-workflow-and-command"
import { FilePicker } from "./file-picker"
import { WorkflowPicker } from "./workflow-picker"
import { ToolPicker } from "./tool-picker"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    slashCommand,
    isFilePickerOpen,
    setIsFilePickerOpen,
    hashtagCommand,
    focusWorkflow,
    focusFile
  } = useContext(ChatbotUIContext)

  const { handleSelectUserFile, handleSelectUserCollection } =
    useWorkflowAndCommand()

  return (
    <>
      <WorkflowPicker />

      <FilePicker
        isOpen={isFilePickerOpen}
        searchQuery={hashtagCommand}
        onOpenChange={setIsFilePickerOpen}
        selectedFileIds={[...newMessageFiles, ...chatFiles].map(
          file => file.id
        )}
        selectedCollectionIds={[]}
        onSelectFile={handleSelectUserFile}
        onSelectCollection={handleSelectUserCollection}
        isFocused={focusFile}
      />

      <ToolPicker />

      <AssistantPicker />
    </>
  )
}
