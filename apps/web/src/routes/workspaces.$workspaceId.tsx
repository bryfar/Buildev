import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceDetailPage } from '@/components/project-flow/workspace-detail-page';

export const Route = createFileRoute('/workspaces/$workspaceId')({
  validateSearch: (raw: Record<string, unknown>): { new?: '1' } => ({
    new: raw.new === '1' || raw.new === 1 ? '1' : undefined,
  }),
  component: WorkspaceDetailRoute,
  head: () => ({
    meta: [{ title: 'Buildev — Workspace' }],
  }),
});

function WorkspaceDetailRoute() {
  const { workspaceId } = Route.useParams();
  const { new: newWizard } = Route.useSearch();
  return <WorkspaceDetailPage workspaceId={workspaceId} bootstrapNewProjectWizard={newWizard === '1'} />;
}
