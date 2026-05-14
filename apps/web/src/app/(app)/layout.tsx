import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Agency-level layout.
 *
 * Top-bar with agency branding + "New campaign" CTA. The campaign-level
 * sidebar lives one level deeper in (app)/campaign/[campaignId]/layout.tsx
 * so it only renders inside a specific campaign.
 *
 * Phase 2: replace static "Admin" with current user + dropdown menu.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-brand-900"
          >
            <span className="inline-block h-6 w-6 rounded-md bg-brand-900" />
            Run Digital Platform
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/campaign/new">
              <Button variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5" />
                New campaign
              </Button>
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
