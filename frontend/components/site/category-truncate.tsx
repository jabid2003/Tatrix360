'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
}

interface CategoryTruncateProps {
  links: SidebarLink[];
  linkTitle?: string;
  mobileLimit?: number;
}

export function CategoryTruncate({
  links,
  linkTitle = 'Categories',
  mobileLimit = 4,
}: CategoryTruncateProps) {
  const [expanded, setExpanded] = useState(false);

  if (links.length === 0) return null;

  const visibleLinks = expanded ? links : links.slice(0, mobileLimit);
  const hasMore = links.length > mobileLimit;

  return (
    <div className="card rounded-2xl p-5">
      <h3 className="mb-3 section-label">{linkTitle}</h3>
      <ul className="space-y-2">
        {visibleLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 md:hidden"
        >
          See more
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}

      {hasMore && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted md:hidden"
        >
          Show less
        </button>
      )}
    </div>
  );
}
