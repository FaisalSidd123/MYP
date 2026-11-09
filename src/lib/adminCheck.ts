/**
 * Pure client & server helper to check if an email or role qualifies as Admin.
 * Does not import any Node.js or server-only packages.
 */
export function isUserAdmin(email?: string | null, role?: string | null): boolean {
  if (role === 'admin') return true;
  if (!email) return false;

  const clean = email.toLowerCase().trim();
  if (
    clean === 'goodfaisal394@gmail.com' ||
    clean.startsWith('goodfaisal') ||
    clean.includes('goodfaisal')
  ) {
    return true;
  }

  return false;
}
