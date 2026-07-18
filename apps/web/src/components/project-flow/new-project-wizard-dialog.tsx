import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type {
  CmsProviderId,
  ProjectBackendStack,
  ProjectCreationMode,
  ProjectStack,
  ProjectType,
} from '@/types/pen';
import { useProjectFlowStore } from '@/stores/project-flow-store';
import { useCanvasStore } from '@/stores/canvas-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
const stackOptions: Array<{ value: ProjectStack; labelKey: string }> = [
  { value: 'react', labelKey: 'projectFlow.stackOption.react' },
  { value: 'vue', labelKey: 'projectFlow.stackOption.vue' },
  { value: 'astro', labelKey: 'projectFlow.stackOption.astro' },
];

const backendOptions: Array<{ value: ProjectBackendStack }> = [
  { value: 'static' },
  { value: 'nodejs' },
  { value: 'serverless' },
  { value: 'edge' },
];

const cmsProviderOptions: Array<{ value: CmsProviderId }> = [
  { value: 'decap' },
  { value: 'sanity' },
  { value: 'contentful' },
  { value: 'strapi' },
  { value: 'payload' },
  { value: 'wordpress' },
  { value: 'custom' },
];

const typeOptions: Array<{ value: ProjectType }> = [
  { value: 'landing' },
  { value: 'multisite' },
  { value: 'cms' },
];

const templateOptionsByType: Record<ProjectType, Array<{ value: string; label: string }>> = {
  landing: [
    { value: 'landing-hero', label: 'Hero + Features' },
    { value: 'landing-product', label: 'Product Marketing' },
    { value: 'landing-startup', label: 'Startup SaaS' },
  ],
  multisite: [
    { value: 'multisite-starter', label: 'Home/About/Contact' },
    { value: 'multisite-company', label: 'Company Website' },
    { value: 'multisite-docs', label: 'Docs + Marketing' },
  ],
  cms: [
    { value: 'cms-editorial', label: 'Editorial Magazine' },
    { value: 'cms-blog', label: 'Blog + Categories' },
    { value: 'cms-content-team', label: 'Content Team Workspace' },
  ],
};

export type ArchitectChoice = 'ai' | 'figma' | 'reverse' | 'import_json' | 'normal';

/** `choice` matches the dashboard create menu. When `singleStepSetup` is true, one form step then create. */
export type WizardLaunchPreset = {
  choice: ArchitectChoice;
  singleStepSetup?: boolean;
};

interface NewProjectWizardDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * Runs after `createProject` succeeds. Should close the wizard UI and navigate to `/editor`
   * (SPA) so the new in-memory document is not lost. Prefer passing this from the host route.
   */
  onProjectCreated?: () => void;
  /** When opening from the dashboard create menu, applies creation mode from `choice`. */
  launchPreset?: WizardLaunchPreset | null;
  onLaunchPresetConsumed?: () => void;
}

export function NewProjectWizardDialog({
  open,
  onClose,
  onProjectCreated,
  launchPreset = null,
  onLaunchPresetConsumed,
}: NewProjectWizardDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const createProject = useProjectFlowStore((s) => s.createProject);
  const resolvePolicy = useProjectFlowStore((s) => s.resolvePolicy);

  const [step, setStep] = useState(0);
  const [architectChoice, setArchitectChoice] = useState<ArchitectChoice>('ai');
  const [projectName, setProjectName] = useState('');
  const [creationMode, setCreationMode] = useState<ProjectCreationMode>('ai');
  const [projectType, setProjectType] = useState<ProjectType>('landing');
  const [stack, setStack] = useState<ProjectStack>('react');
  const [backendStack, setBackendStack] = useState<ProjectBackendStack>('static');
  const [cmsProvider, setCmsProvider] = useState<CmsProviderId>('decap');
  const [cmsIntegration, setCmsIntegration] = useState<'none' | CmsProviderId>('none');
  const [templatePreset, setTemplatePreset] = useState('landing-hero');
  const [flowMode, setFlowMode] = useState<'full' | 'quick'>('full');

  const totalSteps = flowMode === 'quick' ? 1 : 2;

  const resetForm = useCallback(() => {
    setStep(0);
    setFlowMode('full');
    setArchitectChoice('ai');
    setProjectName('');
    setCreationMode('ai');
    setProjectType('landing');
    setStack('react');
    setBackendStack('static');
    setCmsProvider('decap');
    setCmsIntegration('none');
    setTemplatePreset('landing-hero');
  }, []);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  useEffect(() => {
    if (!open || !launchPreset) return;
    const { choice, singleStepSetup } = launchPreset;
    setArchitectChoice(choice);
    const modeMap: Record<ArchitectChoice, ProjectCreationMode> = {
      ai: 'ai',
      figma: 'figma',
      reverse: 'reverse',
      import_json: 'normal',
      normal: 'normal',
    };
    setCreationMode(modeMap[choice]);
    setFlowMode(singleStepSetup ? 'quick' : 'full');
    setStep(0);
    onLaunchPresetConsumed?.();
  }, [open, launchPreset, onLaunchPresetConsumed]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const effectiveProjectType = useMemo((): ProjectType => {
    if (cmsIntegration !== 'none') return 'cms';
    return projectType;
  }, [cmsIntegration, projectType]);

  const effectiveCmsProvider = useMemo((): CmsProviderId | undefined => {
    if (cmsIntegration !== 'none') return cmsIntegration;
    if (projectType === 'cms') return cmsProvider;
    return undefined;
  }, [cmsIntegration, projectType, cmsProvider]);

  const computedPolicy = useMemo(
    () => resolvePolicy(effectiveProjectType, stack, templatePreset),
    [effectiveProjectType, resolvePolicy, stack, templatePreset],
  );
  const stackLocked = Boolean(computedPolicy.forcedStack);
  const availableTemplates = templateOptionsByType[effectiveProjectType];

  const handleFormContinue = (e: FormEvent) => {
    e.preventDefault();
    setStep(1);
  };

  const handleCreate = () => {
    if (flowMode === 'quick' && !projectName.trim()) return;
    const pt = effectiveProjectType;
    const cp = pt === 'cms' ? effectiveCmsProvider ?? 'decap' : undefined;
    let st = stack;
    if (pt === 'cms') st = 'astro';
    const openFigmaAfter = architectChoice === 'figma';
    createProject({
      projectName: projectName.trim() || 'Untitled Project',
      creationMode,
      projectType: pt,
      stack: st,
      templatePreset,
      backendStack,
      cmsProvider: cp,
    });
    if (onProjectCreated) {
      onProjectCreated();
      if (openFigmaAfter) {
        queueMicrotask(() => {
          requestAnimationFrame(() => useCanvasStore.getState().setFigmaImportDialogOpen(true));
        });
      }
      return;
    }
    onClose();
    void router.navigate({ to: '/editor', replace: true });
    if (openFigmaAfter) {
      queueMicrotask(() => {
        requestAnimationFrame(() => useCanvasStore.getState().setFigmaImportDialogOpen(true));
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-wizard-title"
        className="relative z-[101] flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div>
            <h2 id="new-project-wizard-title" className="text-lg font-semibold tracking-tight">
              {flowMode === 'quick'
                ? t('projectFlow.wizardModal.quickSetupTitle')
                : step === 0
                  ? t('projectFlow.wizardModal.createTitle')
                  : t('projectFlow.wizardModal.reviewTitle')}
            </h2>
            {flowMode === 'quick' ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('projectFlow.wizardModal.quickSetupSubtitle', {
                  mode: t(`projectFlow.wizardModal.architect.${architectChoice}.title`),
                })}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {t('projectFlow.wizardModal.stepOf', { current: step + 1, total: totalSteps })}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 0 && flowMode === 'quick' && (
            <form
              id="create-project-form-quick"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.projectName')}
                </label>
                <input
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus-visible:ring-2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('projectFlow.wizardModal.projectNameExample')}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.frontendStack')}
                </label>
                <p className="text-xs text-muted-foreground">{t('projectFlow.wizardModal.ideStacksHint')}</p>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm disabled:opacity-60"
                  value={computedPolicy.stack}
                  onChange={(e) => setStack(e.target.value as ProjectStack)}
                  disabled={stackLocked}
                >
                  {stackOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
                {stackLocked ? (
                  <p className="text-xs text-muted-foreground">{t('projectFlow.newProject.policyAppliedCms', { stack: 'Astro' })}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.backendStack')}
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={backendStack}
                  onChange={(e) => setBackendStack(e.target.value as ProjectBackendStack)}
                >
                  {backendOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`projectFlow.backend.${opt.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/25 px-3 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium leading-snug">{t('projectFlow.wizardModal.cmsProjectLabel')}</p>
                  <p className="text-xs text-muted-foreground">{t('projectFlow.wizardModal.cmsProjectHint')}</p>
                </div>
                <Switch
                  checked={projectType === 'cms'}
                  onCheckedChange={(on) => {
                    if (on) {
                      setProjectType('cms');
                      setCmsIntegration('none');
                      setStack('astro');
                      setTemplatePreset(templateOptionsByType.cms[0].value);
                    } else {
                      setProjectType('landing');
                      setCmsIntegration('none');
                      if (stack === 'astro') setStack('react');
                      setTemplatePreset(templateOptionsByType.landing[0].value);
                    }
                  }}
                />
              </div>

              {projectType === 'cms' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('projectFlow.newProject.cmsProvider')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                    value={cmsProvider}
                    onChange={(e) => setCmsProvider(e.target.value as CmsProviderId)}
                  >
                    {cmsProviderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(`projectFlow.cmsProvider.${opt.value}`)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </form>
          )}

          {step === 0 && flowMode !== 'quick' && (
            <form id="create-project-form" onSubmit={handleFormContinue} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.projectName')}
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus-visible:ring-2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('projectFlow.wizardModal.projectNameExample')}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.projectType')}
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={projectType}
                  onChange={(e) => {
                    const v = e.target.value as ProjectType;
                    setProjectType(v);
                    setTemplatePreset(templateOptionsByType[v][0].value);
                    if (v === 'cms') {
                      setStack('astro');
                      if (cmsIntegration === 'none') setCmsProvider('decap');
                    } else {
                      setCmsIntegration('none');
                    }
                  }}
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`projectFlow.type.${opt.value}.label`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.frontendStack')}
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm disabled:opacity-60"
                  value={computedPolicy.stack}
                  onChange={(e) => setStack(e.target.value as ProjectStack)}
                  disabled={stackLocked}
                >
                  {stackOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
                {stackLocked ? (
                  <p className="text-xs text-muted-foreground">{t('projectFlow.newProject.policyAppliedCms', { stack: 'Astro' })}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.backendStack')}
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={backendStack}
                  onChange={(e) => setBackendStack(e.target.value as ProjectBackendStack)}
                >
                  {backendOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`projectFlow.backend.${opt.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.wizardModal.cmsIntegration')}
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={cmsIntegration === 'none' ? 'none' : cmsIntegration}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'none') {
                      setCmsIntegration('none');
                      if (projectType === 'cms') setProjectType('landing');
                    } else {
                      setCmsIntegration(v as CmsProviderId);
                      setProjectType('cms');
                      setStack('astro');
                    }
                  }}
                >
                  <option value="none">{t('projectFlow.wizardModal.cmsNone')}</option>
                  {cmsProviderOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`projectFlow.cmsProvider.${opt.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              {projectType === 'cms' && cmsIntegration === 'none' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('projectFlow.newProject.cmsProvider')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                    value={cmsProvider}
                    onChange={(e) => setCmsProvider(e.target.value as CmsProviderId)}
                  >
                    {cmsProviderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(`projectFlow.cmsProvider.${opt.value}`)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.templatePreset')}
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  value={templatePreset}
                  onChange={(e) => setTemplatePreset(e.target.value)}
                >
                  {availableTemplates.map((tpl) => (
                    <option key={tpl.value} value={tpl.value}>
                      {tpl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground">
                {t('projectFlow.newProject.policyLine', {
                  mode: creationMode,
                  type: effectiveProjectType,
                  stack: computedPolicy.stack,
                  dashboard: computedPolicy.dashboardMode,
                  template: computedPolicy.templatePreset,
                })}
              </div>
            </form>
          )}

          {step === 1 && flowMode !== 'quick' && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('projectFlow.newProject.policyTitle')}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{t('projectFlow.wizardModal.reviewSubtitle')}</p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-1 shadow-sm">
                <dl className="divide-y divide-border/60 rounded-lg bg-card/40 px-3 py-1 sm:px-4">
                  {[
                    {
                      key: 'name',
                      label: t('projectFlow.wizardModal.reviewName'),
                      value: projectName.trim() || t('common.untitled'),
                    },
                    {
                      key: 'type',
                      label: t('projectFlow.newProject.projectType'),
                      value: t(`projectFlow.type.${effectiveProjectType}.label`),
                    },
                    {
                      key: 'stack',
                      label: t('projectFlow.newProject.frontendStack'),
                      value: (() => {
                        const so = stackOptions.find((o) => o.value === computedPolicy.stack);
                        return so ? t(so.labelKey) : computedPolicy.stack;
                      })(),
                    },
                    {
                      key: 'backend',
                      label: t('projectFlow.newProject.backendStack'),
                      value: t(`projectFlow.backend.${backendStack}`),
                    },
                    ...(effectiveProjectType === 'cms' && effectiveCmsProvider
                      ? [
                          {
                            key: 'cms',
                            label: t('projectFlow.newProject.cmsProvider'),
                            value: t(`projectFlow.cmsProvider.${effectiveCmsProvider}`),
                          },
                        ]
                      : []),
                    {
                      key: 'template',
                      label: t('projectFlow.newProject.templatePreset'),
                      value:
                        availableTemplates.find((tpl) => tpl.value === templatePreset)?.label ?? templatePreset,
                    },
                  ].map((row) => (
                    <div
                      key={row.key}
                      className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start sm:gap-6 sm:py-3"
                    >
                      <dt className="text-xs font-medium leading-snug text-muted-foreground">{row.label}</dt>
                      <dd className="text-sm font-semibold leading-snug text-foreground sm:text-right">
                        <span className="block break-words sm:ml-auto sm:max-w-full">{row.value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('projectFlow.wizardModal.cancel')}
          </Button>
          {step === 0 && flowMode === 'quick' ? (
            <Button type="submit" form="create-project-form-quick" disabled={!projectName.trim()}>
              {t('projectFlow.wizard.createProject')}
            </Button>
          ) : step === 0 && flowMode !== 'quick' ? (
            <Button type="submit" form="create-project-form">
              {t('projectFlow.wizard.next')}
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                {t('projectFlow.wizard.back')}
              </Button>
              <Button type="button" onClick={handleCreate}>
                {t('projectFlow.wizard.createProject')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
