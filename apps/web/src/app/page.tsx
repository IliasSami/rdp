import { redirect } from 'next/navigation';

/**
 * Root entry. Phase 1: always redirect to /login.
 * Phase 2: check session cookie → /campaigns if authed, else /login.
 */
export default function HomePage(): never {
  redirect('/login');
}
