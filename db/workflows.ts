import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getWorkflowById = async (workflowId: string) => {
  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowId)
    .single()

  if (!workflow) {
    throw new Error(error.message)
  }

  return workflow
}

export const getWorkflowWorkspacesByWorkspaceId = async (
  workspaceId: string
) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      workflows (*)
    `
    )
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getWorkflowWorkspacesByWorkflowId = async (workflowId: string) => {
  const { data: workflow, error } = await supabase
    .from("workflows")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", workflowId)
    .single()

  if (!workflow) {
    throw new Error(error.message)
  }

  return workflow
}

export const createWorkflow = async (
  workflow: TablesInsert<"workflows">,
  workspace_id: string
) => {
  const { data: createdWorkflow, error } = await supabase
    .from("workflows")
    .insert([workflow])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createWorkflowWorkspace({
    user_id: createdWorkflow.user_id,
    workflow_id: createdWorkflow.id,
    workspace_id
  })

  return createdWorkflow
}

export const createWorkflows = async (
  workflows: TablesInsert<"workflows">[],
  workspace_id: string
) => {
  const { data: createdWorkflows, error } = await supabase
    .from("workflows")
    .insert(workflows)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createWorkflowWorkspaces(
    createdWorkflows.map(workflow => ({
      user_id: workflow.user_id,
      workflow_id: workflow.id,
      workspace_id
    }))
  )

  return createdWorkflows
}

export const createWorkflowWorkspace = async (item: {
  user_id: string
  workflow_id: string
  workspace_id: string
}) => {
  const { data: createdWorkflowWorkspace, error } = await supabase
    .from("workflow_workspaces")
    .insert([item])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdWorkflowWorkspace
}

export const createWorkflowWorkspaces = async (
  items: { user_id: string; workflow_id: string; workspace_id: string }[]
) => {
  const { data: createdWorkflowWorkspaces, error } = await supabase
    .from("workflow_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdWorkflowWorkspaces
}

export const updateWorkflow = async (
  workflowId: string,
  workflow: TablesUpdate<"workflows">
) => {
  const { data: updatedWorkflow, error } = await supabase
    .from("workflows")
    .update(workflow)
    .eq("id", workflowId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedWorkflow
}

export const deleteWorkflow = async (workflowId: string) => {
  const { error } = await supabase
    .from("workflows")
    .delete()
    .eq("id", workflowId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteWorkflowWorkspace = async (
  workflowId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("workflow_workspaces")
    .delete()
    .eq("workflow_id", workflowId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}
