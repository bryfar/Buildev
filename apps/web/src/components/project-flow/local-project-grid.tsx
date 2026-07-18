import { useState } from 'react';
import { PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type ProjectMoveMenuConfig = {
  /** If set, project is assigned to that workspace; `null` means draft / unassigned. */
  currentWorkspaceId: string | null;
  workspaces: Array<{ id: string; name: string }>;
  /** `null` = move to Drafts; otherwise assign to that workspace id. */
  onMoveTo: (targetWorkspaceId: string | null) => void;
};

export type LocalProjectGridItem = {
  id: string;
  title: string;
  subtitle: string;
  /** When false, open is disabled (e.g. browser without path). */
  canOpen: boolean;
  onOpen: () => void | Promise<void>;
  /** Label for the hover overlay button; defaults to "Open editor". */
  openActionLabel?: string;
  /** When true, clicking the card body (not only the overlay) runs onOpen when canOpen. */
  openOnCardClick?: boolean;
  /** Optional text action below the subtitle (e.g. move to drafts). */
  footerAction?: { label: string; onClick: () => void };
  /** Move between Drafts and workspaces (same logical project key as `id`). */
  moveMenu?: ProjectMoveMenuConfig;
};

type LocalProjectGridProps = {
  items: LocalProjectGridItem[];
  viewMode: 'grid' | 'list';
  emptyMessage: string;
};

const cardShell =
  'group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/35 hover:shadow-md';
const thumbArea = 'relative flex aspect-[16/10] items-center justify-center bg-muted/50';

function ProjectMoveRow({ menu }: { menu: ProjectMoveMenuConfig }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const draftOption =
    menu.currentWorkspaceId !== null
      ? [{ key: '__drafts__', label: t('projectFlow.move.toDrafts'), value: null as string | null }]
      : [];

  const wsOptions = menu.workspaces
    .filter((w) => w.id !== menu.currentWorkspaceId)
    .map((w) => ({ key: w.id, label: w.name, value: w.id as string | null }));

  const options = [...draftOption, ...wsOptions];
  if (options.length === 0) return null;

  return (
    <div
      className="mt-2"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-full justify-center border-border bg-background px-2 text-[11px] font-medium text-foreground shadow-sm hover:bg-accent"
            aria-label={t('projectFlow.move.menuAria')}
          >
            {t('projectFlow.move.trigger')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[12rem] p-1" onClick={(e) => e.stopPropagation()}>
          {draftOption.length > 0 ? (
            <>
              {draftOption.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    menu.onMoveTo(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
              {wsOptions.length > 0 ? <DropdownMenuSeparator /> : null}
            </>
          ) : null}
          {wsOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.key}
              className="cursor-pointer text-xs"
              onClick={() => {
                menu.onMoveTo(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function LocalProjectGrid({ items, viewMode, emptyMessage }: LocalProjectGridProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center">
        <p className="max-w-md text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'gap-4',
        viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col',
      )}
    >
      {items.map((item) => {
        const openLabel = item.openActionLabel ?? t('projectFlow.dashboard.cardOpenEditor');
        const cardActivates = item.canOpen && (item.openOnCardClick !== false);

        const runOpen = () => {
          if (!item.canOpen) return;
          void item.onOpen();
        };

        return (
        <article
          key={item.id}
          role={cardActivates ? 'button' : undefined}
          tabIndex={cardActivates ? 0 : undefined}
          onClick={cardActivates ? runOpen : undefined}
          onKeyDown={
            cardActivates
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    runOpen();
                  }
                }
              : undefined
          }
          className={cn(
            cardShell,
            viewMode === 'list' && 'flex flex-row',
            cardActivates &&
              'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <div
            className={cn(
              thumbArea,
              viewMode === 'list' && 'aspect-auto w-36 min-h-[7.5rem] shrink-0 border-r border-border sm:w-44',
            )}
          >
            <PenTool className="h-14 w-14 text-primary/40" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center bg-background/0 p-4 opacity-0 transition group-hover:bg-background/70 group-hover:opacity-100">
              <Button
                type="button"
                size="sm"
                disabled={!item.canOpen}
                title={!item.canOpen ? t('projectFlow.localProjects.openUnavailableHint') : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  runOpen();
                }}
              >
                {openLabel}
              </Button>
            </div>
          </div>
          <div
            className={cn(
              'border-t border-border p-3',
              viewMode === 'list' && 'flex flex-1 flex-col justify-center border-t-0 border-l-0',
            )}
          >
            <h3 className="truncate text-sm font-semibold">{item.title}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{item.subtitle}</p>
            {item.footerAction ? (
              <button
                type="button"
                className="mt-2 text-left text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  item.footerAction?.onClick();
                }}
              >
                {item.footerAction.label}
              </button>
            ) : null}
            {item.moveMenu ? <ProjectMoveRow menu={item.moveMenu} /> : null}
          </div>
        </article>
        );
      })}
    </div>
  );
}
