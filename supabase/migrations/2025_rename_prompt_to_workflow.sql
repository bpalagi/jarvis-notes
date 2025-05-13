-- Create a new migration file in supabase/migrations
ALTER TABLE prompts RENAME TO workflows;
ALTER TABLE prompt_workspaces RENAME TO workflow_workspaces;
-- Update any foreign key references
ALTER TABLE workflow_workspaces RENAME COLUMN prompt_id TO workflow_id;
-- etc.