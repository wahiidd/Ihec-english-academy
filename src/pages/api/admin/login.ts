import type { APIRoute } from 'astro';
import { checkPassword, endSession, startSession } from '../../../lib/server/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const form = await request.formData();
  const action = form.get('action');
  if (action === 'logout') {
    endSession(cookies);
    return redirect('/admin', 303);
  }
  if (!checkPassword(String(form.get('password') ?? ''))) return redirect('/admin?error=1', 303);
  startSession(cookies, url.protocol === 'https:');
  const next = String(form.get('next') ?? '');
  return redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/admin', 303);
};
