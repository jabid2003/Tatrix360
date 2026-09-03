import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import type { NavbarLink } from '@/types/navbar';

export function MegaMenu({ link }: { link: NavbarLink }) {
  if (!link.children?.length) return null;
  const PanelIcon = (Icons as any)[link.icon_name ?? 'Circle'] ?? Icons.Circle;
  return (
    <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-2 group-hover:block">
      <div className="relative z-50 w-[560px] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-border bg-popover px-5 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
            <PanelIcon className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground leading-none">{link.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{link.description ?? 'Explore'}</p>
          </div>
          <Link
            href={link.slug}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {/* grid — submenu items keep icons */}
        <div className="grid grid-cols-2 gap-px bg-border">
          {link.children.map((c) => {
            const C = (Icons as any)[c.icon_name ?? 'Circle'] ?? Icons.Circle;
            return (
              <Link
                key={c.id}
                href={c.slug}
                className="group/item flex items-start gap-3 bg-popover p-4 transition-colors hover:bg-muted"
              >
                <C className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover/item:text-foreground" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-none text-foreground">{c.label}</span>
                  {c.description && (
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                      {c.description}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Dropdown({ link }: { link: NavbarLink }) {
  if (!link.children?.length) return null;
  return (
    <div className="absolute left-0 top-full hidden min-w-48 pt-2 group-hover:block">
      <div className="relative z-50 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
        {link.children.map((c) => {
          const C = (Icons as any)[c.icon_name ?? 'Circle'] ?? Icons.Circle;
          return (
            <Link
              key={c.id}
              href={c.slug}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <C className="h-4 w-4 text-muted-foreground" />
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
