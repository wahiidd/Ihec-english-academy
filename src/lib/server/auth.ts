import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { ADMIN_PASSWORD, ADMIN_SECRET } from 'astro:env/server';

const COOKIE = 'iea_admin';
const TTL_MS = 12 * 60 * 60 * 1000;

const sign = (value: string) => createHmac('sha256', ADMIN_SECRET ?? '').update(value).digest('base64url');

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export const adminConfigured = () => Boolean(ADMIN_PASSWORD && ADMIN_SECRET);

export const checkPassword = (input: string) => adminConfigured() && safeEqual(input, ADMIN_PASSWORD!);

export const startSession = (cookies: AstroCookies, secure: boolean) => {
  const expires = String(Date.now() + TTL_MS);
  cookies.set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_MS / 1000,
  });
};

export const endSession = (cookies: AstroCookies) => cookies.delete(COOKIE, { path: '/' });

export const isAdmin = (cookies: AstroCookies) => {
  if (!adminConfigured()) return false;
  const value = cookies.get(COOKIE)?.value;
  if (!value) return false;
  const [expires, mac] = value.split('.');
  if (!expires || !mac || !safeEqual(mac, sign(expires))) return false;
  return Number(expires) > Date.now();
};
