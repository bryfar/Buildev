import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import { DashboardShell } from '@/components/project-flow/dashboard-shell';
import { useDashboardNavSections } from '@/components/project-flow/dashboard-nav-sections';
import { LocalProjectGrid, type LocalProjectGridItem } from '@/components/project-flow/local-project-grid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspaceRegistryStore } from '@/stores/workspace-registry-store';
import { useDocumentStore } from '@/stores/document-store';
import { getRecentFiles, relativeTime, type RecentFile } from '@/utils/recent-files';
import { tryOpenRecentProjectFile } from '@/utils/open-recent-project';
import { isElectron } from '@/utils/file-operations';
import { setPendingWorkspaceId, clearPendingWorkspaceId } from '@/utils/pending-workspace-assignment';
import { NewProjectWizardDialog, type WizardLaunchPreset } from '@/components/project-flow/new-project-wizard-dialog';

function normalizePathForId(path: string): string {
  return path.replace(/\\/g, '/');
}

function recentProjectId(r: RecentFile): string {
  if (r.filePath) return `path:${normalizePathForId(r.filePath)}`;
  return `name:${r.fileName}`;
}

function labelForProjectKey(key: string, recentByKey: Map<string, RecentFile>): string {
  const r = recentByKey.get(key);
  if (r) return r.fileName;
  if (key.startsWith('path:')) return key.slice('path:'.length).split('/').pop() ?? key;
  if (key.startsWith('name:')) return key.slice('name:'.length);
  return key;
}

/** Prevents double wizard open under React Strict Mode for the same workspace + ?new=1 visit. */
const workspaceBootstrapNewWizardConsumed = new Set<string>();

type Props = { workspaceId: string; bootstrapNewProjectWizard?: boolean };

export function WorkspaceDetailPage({ workspaceId, bootstrapNewProjectWizard = false }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const navSections = useDashboardNavSections();
  const workspaces = useWorkspaceRegistryStore((s) => s.workspaces);
  const assignmentByProject = useWorkspaceRegistryStore((s) => s.assignmentByProject);
  const listProjectKeysInWorkspace = useWorkspaceRegistryStore((s) => s.listProjectKeysInWorkspace);
  const assignProjectToWorkspace = useWorkspaceRegistryStore((s) => s.assignProjectToWorkspace);
  const releaseProject = useWorkspaceRegistryStore((s) => s.releaseProject);
  const renameWorkspace = useWorkspaceRegistryStore((s) => s.renameWorkspace);
  const deleteWorkspace = useWorkspaceRegistryStore((s) => s.deleteWorkspace);

  const [workspaceWizardOpen, setWorkspaceWizardOpen] = useState(false);
  const [workspaceWizardPreset, setWorkspaceWizardPreset] = useState<WizardLaunchPreset | null>(null);

  const openNewProjectWizard = useCallback(() => {
    setPendingWorkspaceId(workspaceId);
    setWorkspaceWizardPreset({ choice: 'normal', singleStepSetup: true });
    setWorkspaceWizardOpen(true);
  }, [workspaceId]);

  const projectMeta = useDocumentStore((s) => s.document.projectMeta);
  const fileName = useDocumentStore((s) => s.fileName);
  const workspaceLabel = projectMeta?.projectName ?? fileName ?? null;

  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [renameDraft, setRenameDraft] = useState('');
  const workspace = useMemo(() => workspaces.find((w) => w.id === workspaceId) ?? null, [workspaces, workspaceId]);

  useLayoutEffect(() => {
    if (!bootstrapNewProjectWizard || !workspace) return;
    if (workspaceBootstrapNewWizardConsumed.has(workspaceId)) return;
    workspaceBootstrapNewWizardConsumed.add(workspaceId);
    openNewProjectWizard();
    void navigate({
      to: '/workspaces/$workspaceId',
      params: { workspaceId },
      search: {},
      replace: true,
    });
  }, [bootstrapNewProjectWizard, workspace, workspaceId, navigate, openNewProjectWizard]);

  useEffect(() => {
    if (workspace) setRenameDraft(workspace.name);
  }, [workspace]);

  const recentByKey = useMemo(() => {
    const m = new Map<string, RecentFile>();
    for (const r of getRecentFiles()) {
      m.set(recentProjectId(r), r);
    }
    return m;
  }, [assignmentByProject]);

  const inWorkspaceKeys = useMemo(
    () => listProjectKeysInWorkspace(workspaceId),
    [listProjectKeysInWorkspace, workspaceId, assignmentByProject],
  );

  const draftKeys = useMemo(() => {
    const keys: string[] = [];
    for (const r of getRecentFiles()) {
      const id = recentProjectId(r);
      if (!assignmentByProject[id] && r.filePath) keys.push(id);
    }
    return keys;
  }, [assignmentByProject]);

  const workspacePickerRows = useMemo(
    () => workspaces.map((w) => ({ id: w.id, name: w.name })),
    [workspaces],
  );

  const formatRelative = (ts: number) => {
    const { key, params } = relativeTime(ts);
    return i18n.t(key, params);
  };

  const gridItems: LocalProjectGridItem[] = useMemo(() => {
    return inWorkspaceKeys.map((key) => {
      const r = recentByKey.get(key);
      const title = labelForProjectKey(key, recentByKey);
      const subtitle = r ? formatRelative(r.lastOpened) : t('projectFlow.workspaceDetail.notInRecents');
      const canOpen = Boolean(r?.filePath && isElectron());
      return {
        id: key,
        title,
        subtitle,
        canOpen,
        onOpen: async () => {
          if (!r) return;
          const ok = await tryOpenRecentProjectFile(r);
          if (ok) void navigate({ to: '/editor' });
        },
        moveMenu: {
          currentWorkspaceId: workspaceId,
          workspaces: workspacePickerRows,
          onMoveTo: (target) => {
            if (target === null) releaseProject(key);
            else assignProjectToWorkspace(key, target);
          },
        },
      };
    });
  }, [
    inWorkspaceKeys,
    recentByKey,
    t,
    i18n,
    navigate,
    releaseProject,
    assignProjectToWorkspace,
    workspaceId,
    workspacePickerRows,
  ]);

  if (!workspace) {
    return (
      <DashboardShell navSections={navSections} workspaceLabel={workspaceLabel} workspaceActive={Boolean(projectMeta || fileName)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">{t('projectFlow.workspaceDetail.missing')}</p>
          <Button type="button" variant="outline" onClick={() => void navigate({ to: '/workspaces' })}>
            {t('projectFlow.workspaceDetail.back')}
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const onNewProjectInWorkspace = openNewProjectWizard;

  return (
    <DashboardShell navSections={navSections} workspaceLabel={workspaceLabel} workspaceActive={Boolean(projectMeta || fileName)}>
      <NewProjectWizardDialog
        open={workspaceWizardOpen}
        onClose={() => {
          setWorkspaceWizardOpen(false);
          setWorkspaceWizardPreset(null);
          clearPendingWorkspaceId();
        }}
        onProjectCreated={() => {
          setWorkspaceWizardOpen(false);
          setWorkspaceWizardPreset(null);
          void navigate({ to: '/editor', replace: true });
        }}
        launchPreset={workspaceWizardPreset}
        onLaunchPresetConsumed={() => setWorkspaceWizardPreset(null)}
      />
      <div className="flex min-h-screen flex-1 flex-col bg-background text-foreground">
        <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:px-8">
          <nav
            className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground"
            aria-label={t('projectFlow.shell.breadcrumbAria')}
          >
            <Link to="/workspaces" className="hover:underline">
              {t('projectFlow.workspaces.title')}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate font-medium text-foreground">{workspace.name}</span>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Link to="/workspaces" className="inline-flex items-center justify-center shrink-0 h-8 w-8 rounded-md hover:bg-accent" aria-label={t('projectFlow.workspaceDetail.back')}>
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight">{workspace.name}</h1>
                <p className="text-xs text-muted-foreground">{t('projectFlow.workspaceDetail.subtitle')}</p>
              </div>
            </div>
            <Button type="button" className="gap-1.5" onClick={onNewProjectInWorkspace}>
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              {t('projectFlow.workspaceDetail.newProject')}
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('projectFlow.workspaceDetail.renameLabel')}
              </label>
              <input
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                className="h-9 w-full max-w-md rounded-md border border-border bg-background px-3 text-sm outline-none ring-primary/30 focus-visible:ring-2"
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => renameWorkspace(workspaceId, renameDraft)}>
              {t('projectFlow.workspaceDetail.saveName')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (window.confirm(t('projectFlow.workspaceDetail.deleteConfirm'))) {
                  deleteWorkspace(workspaceId);
                  void navigate({ to: '/workspaces' });
                }
              }}
            >
              {t('projectFlow.workspaceDetail.deleteWorkspace')}
            </Button>
          </div>

          {draftKeys.length > 0 ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs text-muted-foreground">{t('projectFlow.workspaceDetail.addFromDrafts')}</span>
              <Select
                onValueChange={(v) => {
                  assignProjectToWorkspace(v, workspaceId);
                }}
              >
                <SelectTrigger className="h-8 w-full max-w-xs border-border bg-background text-xs sm:w-[14rem]">
                  <SelectValue placeholder={t('projectFlow.workspaceDetail.pickDraft')} />
                </SelectTrigger>
                <SelectContent>
                  {draftKeys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {labelForProjectKey(k, recentByKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </header>

        <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
          {gridItems.length === 0 ? (
            <div className="flex min-h-[min(22rem,50vh)] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
              <div className="max-w-md space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {t('projectFlow.workspaceDetail.emptyHeroTitle')}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t('projectFlow.workspaceDetail.emptyHeroDescription')}
                </p>
              </div>
              <Button type="button" className="gap-1.5" onClick={onNewProjectInWorkspace}>
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                {t('projectFlow.workspaceDetail.newProject')}
              </Button>
            </div>
          ) : (
            <LocalProjectGrid
              items={gridItems}
              viewMode={viewMode}
              emptyMessage={t('projectFlow.workspaceDetail.emptyProjects')}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
