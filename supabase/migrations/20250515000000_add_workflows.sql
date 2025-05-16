--------------- WORKFLOWS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS workflows (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- OPTIONAL RELATIONSHIPS
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    -- SHARING
    sharing TEXT NOT NULL DEFAULT 'private',

    -- REQUIRED
    description TEXT NOT NULL CHECK (char_length(description) <= 500),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    
    -- WORKFLOW SPECIFIC
    content JSONB DEFAULT '{}'::jsonb
);

-- INDEXES --

CREATE INDEX workflows_user_id_idx ON workflows(user_id);

-- RLS --

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own workflows"
    ON workflows
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow view access to non-private workflows"
    ON workflows
    FOR SELECT
    USING (sharing <> 'private');

-- TRIGGERS --

CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON workflows
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

--------------- WORKFLOW WORKSPACES ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS workflow_workspaces (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    PRIMARY KEY(workflow_id, workspace_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX workflow_workspaces_user_id_idx ON workflow_workspaces(user_id);
CREATE INDEX workflow_workspaces_workflow_id_idx ON workflow_workspaces(workflow_id);
CREATE INDEX workflow_workspaces_workspace_id_idx ON workflow_workspaces(workspace_id);

-- RLS --

ALTER TABLE workflow_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own workflow_workspaces"
    ON workflow_workspaces
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_workflow_workspaces_updated_at
BEFORE UPDATE ON workflow_workspaces 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();