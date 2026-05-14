'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Settings2,
  FileText,
  Link2,
  Share2,
  BarChart3,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Empty string = overview (campaign root). */
  href: string;
}

/**
 * 6-tab campaign nav — verbatim from MASTER_BUILD_PROMPT.md §1.8.
 * Order is fixed: Overview, Local, Technical, On-Page, Off-Page, Social, Reports.
 */
const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '' },
  { id: 'local-seo', label: 'Local SEO', icon: MapPin, href: 'local-seo' },
  { id: 'technical-seo', label: 'Technical SEO', icon: Settings2, href: 'technical-seo' },
  { id: 'on-page-seo', label: 'On-Page SEO', icon: FileText, href: 'on-page-seo' },
  { id: 'off-page-seo', label: 'Off-Page SEO', icon: Link2, href: 'off-page-seo' },
  { id: 'social', label: 'Social', icon: Share2, href: 'social' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: 'reports' },
];

interface SidebarProps {
  campaignId: string;
  /** Pending draft count for the bell badge. Phase 1: hardcoded 0. */
  pendingDraftCount?: number;
}

export function Sidebar({
  campaignId,
  pendingDraftCount = 0,
}: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const base = `/campaign/${campaignId}`;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-200 bg-white">
      {/* Campaign header */}
      <div className="border-b border-brand-200 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
          Campaign
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-brand-900">
          {campaignId.slice(0, 8)}…
        </p>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map((item) => {
          const href = item.href ? `${base}/${item.href}` : base;
          const active = item.href
            ? pathname?.startsWith(href)
            : pathname === base;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-900 text-white'
                  : 'text-brand-600 hover:bg-brand-100 hover:text-brand-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Approval queue (bell with badge) */}
      <div className="border-t border-brand-200 p-3">
        <Link
          href={`${base}/queue`}
          className={cn(
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === `${base}/queue`
              ? 'bg-brand-900 text-white'
              : 'text-brand-600 hover:bg-brand-100 hover:text-brand-900',
          )}
        >
          <span className="flex items-center gap-3">
            <Bell className="h-4 w-4 shrink-0" />
            <span>Approval Queue</span>
          </span>
          {pendingDraftCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-status-pending px-1.5 text-[10px] font-semibold text-white">
              {pendingDraftCount > 99 ? '99+' : pendingDraftCount}
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
