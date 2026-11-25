/**
 * Email validation utility to block disposable, burner, temporary, and AI/bot generated spam emails.
 */

// List of disposable, temporary, burner, and fake email providers
const DISPOSABLE_DOMAINS = new Set([
  // Popular Disposable Email Services
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minmail.com', '20minutemail.com',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'binkmail.com', 'bobmail.info', 'chammy.info', 'devnullmail.com', 'letthemeatspam.com', 'mailinater.com', 'suremail.info', 'zippymail.info',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamailblock.com', 'grr.la', 'sharklasers.com', 'pokemail.net', 'spam4.me',
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'temp-mail.io', 'tempmailaddress.com', 'tempail.com', 'tempinbox.com',
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.org', 'trashmail.ws', 'trash-mail.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf', 'hide.biz.st', 'mymail.infos.st',
  'getairmail.com', 'airmail.ne.tz', 'dispostable.com', 'fakeinbox.com', 'throwawaymail.com', 'crazymailing.com',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com', 'fckmail.com', 'superrito.com', 'teleworm.us', 'rhyta.com', 'jourrapide.com', 'gustr.com',
  'dropmail.me', '10mail.org', 'yomail.info', 'emkei.cz', 'mohmal.com', 'mohmal.in', 'mohmal.im',
  'burnermail.io', 'burneremail.com', 'nada.ltd', 'inboxkitten.com', 'generator.email', 'emailfake.com',
  'fakemailgenerator.com', 'fakemail.net', 'fakemail.io', 'fakemail.org', 'zillamail.com', 'maildrop.cc',
  'mintemail.com', 'mytemp.email', 'mytempemail.com', 'harakirimail.com', 'tmail.ws', 'emailondeck.com',
  'spambox.us', 'jetable.org', 'mailcatch.com', 'deadaddress.com', 'discard.email', 'discardmail.com',
  'spamevader.com', 'tempemail.net', 'tempemail.co', 'throwawayemailaddress.com', 'trashymail.com',
  'getnada.com', 'abcvg.com', 'boximail.com', 'clrmail.com', 'dropmail.top', 'duck2.club',
  'emlhub.com', 'emlpro.com', 'inboxproxy.com', 'maildu.de', 'mohmal.tech', 'mytrashmail.com',
  'no-spam.ws', 'nowmymail.com', 'onewaymail.com', 'owlpic.com', 'pookmail.com', 'proxymail.eu',
  'quickinbox.com', 'rcpt.at', 'recursor.net', 'safe-mail.net', 'sogetthis.com', 'soodonims.com',
  'spamfree24.org', 'spaml.com', 'spammotel.com', 'spamspot.com', 'spamtrap.ro', 'tafmail.com',
  'tempm.com', 'temporarymail.com', 'temporaryemail.net', 'thespambox.com', 'trbvm.com',
  'uggsrock.com', 'veryrealemail.com', 'whyspam.me', 'willselfdestruct.com', 'wwwnew.eu',
  'xagloo.com', 'yapped.net', 'zippymail.com', 'zoemail.org', '0-mail.com', '0815.ru',
  '0clickemail.com', '100k.nl', '1000rebates.stream', '10minutemail.be', '10minutemail.cf',
  '10minutemail.co.uk', '10minutemail.co.za', '10minutemail.de', '10minutemail.eu', '10minutemail.fr',
  '10minutemail.info', '10minutemail.pro', '10minutemail.us', '20minutemail.it', '33mail.com',
  'anonaddy.com', 'anonaddy.me', 'simplelogin.co', 'simplelogin.io', 'relay.firefox.com',
  // Common AI generator / Bot test patterns & domains
  'aicontent.fake', 'tempai.net', 'aimail.generator', 'botmail.com', 'testmail.com', 'sample.com',
  'example.com', 'example.org', 'example.net', 'test.com', 'localhost.com', 'invalid.com',
]);

// Blocked Top-Level Domains commonly used exclusively for disposable / spam / test nets
const BLOCKED_TLDS = new Set([
  'test', 'invalid', 'localhost', 'example', 'local',
]);

/**
 * Validates whether an email address is valid, properly formatted, and not a disposable, fake, or AI burner address.
 * @param {string} email 
 * @returns {{ isValid: boolean, error?: string }}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Please provide a valid email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic RFC 5322 regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: 'The email address format is invalid.' };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'The email address format is invalid.' };
  }

  const [localPart, domain] = parts;

  // Domain structure checks
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, error: 'The email domain is invalid.' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (BLOCKED_TLDS.has(tld)) {
    return { isValid: false, error: 'Email addresses with this top-level domain are not accepted.' };
  }

  // Check against known disposable/burner/temp-mail domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { 
      isValid: false, 
      error: 'Temporary, disposable, and burner email addresses (e.g. @' + domain + ') are not allowed. Please use a permanent email address (like Gmail, Outlook, Yahoo, or your personal/work domain).' 
    };
  }

  // Check for common temporary domain keywords
  const tempKeywords = ['tempmail', 'disposable', 'throwaway', '10minute', 'trashmail', 'fakeinbox', 'burnermail', 'guerrillamail', 'fakemail', 'generator-email'];
  for (const keyword of tempKeywords) {
    if (domain.includes(keyword)) {
      return {
        isValid: false,
        error: 'Disposable or temporary email services are not permitted. Please use a legitimate email address.'
      };
    }
  }

  // Check for obvious bot / AI generated username patterns
  // E.g. long string of 12+ consecutive consonants or pure hex/random hashes like abc123def456789a
  const consonantsOnly = /^[bcdfghjklmnpqrstvwxyz]{10,}$/i;
  if (consonantsOnly.test(localPart)) {
    return {
      isValid: false,
      error: 'The email address appears to be computer-generated. Please use a valid personal email.'
    };
  }

  // Minimum length checks
  if (localPart.length < 2) {
    return { isValid: false, error: 'The email username is too short.' };
  }

  return { isValid: true };
};

module.exports = {
  validateEmail,
  DISPOSABLE_DOMAINS,
};
