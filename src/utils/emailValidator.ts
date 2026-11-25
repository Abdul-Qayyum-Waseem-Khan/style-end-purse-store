/**
 * Client-side email validation and disposable/fake email detector for Style End Purse
 */

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net', 'guerrillamail.com', 'tempmail.com', 'temp-mail.org',
  '10minutemail.com', '10minutemail.net', 'yopmail.com', 'sharklasers.com', 'getairmail.com',
  'dispostable.com', 'fakeinbox.com', 'throwawaymail.com', 'trashmail.com', 'burnermail.io',
  'nada.ltd', 'inboxkitten.com', 'mohmal.com', 'dropmail.me', 'armyspy.com', 'cuvox.de',
  'dayrep.com', 'fckmail.com', 'generator.email', 'emailfake.com', 'fakemailgenerator.com',
  'fakemail.net', 'zillamail.com', 'maildrop.cc', 'mintemail.com', 'mytemp.email', 'tmail.ws',
  'emailondeck.com', 'spambox.us', 'jetable.org', 'testmail.com', 'sample.com', 'example.com',
]);

export function validateClientEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email address format.' };
  }

  const [, domain] = parts;
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `Disposable emails (@${domain}) are not allowed. Please use your real email.`,
    };
  }

  const tempKeywords = ['tempmail', 'disposable', 'throwaway', '10minute', 'trashmail', 'fakeinbox', 'burnermail', 'guerrillamail', 'fakemail'];
  for (const keyword of tempKeywords) {
    if (domain.includes(keyword)) {
      return {
        isValid: false,
        error: 'Disposable or temporary email services are not permitted.',
      };
    }
  }

  return { isValid: true };
}
