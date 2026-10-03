/**
 * Intelligent Email & Account Verification Utility
 * Handles RFC 5322 compliance, syntax checks, domain validation,
 * disposable domain detection, and intelligent typo correction suggestions.
 */

export interface EmailValidationResult {
  isValid: boolean;
  status: 'valid' | 'invalid' | 'warning' | 'empty';
  message: string;
  suggestedCorrection?: string;
  isDisposable?: boolean;
  isRecognizedProvider?: boolean;
  domain?: string;
  localPart?: string;
}

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'fake.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'temp-mail.org',
  'maildrop.cc',
  'burnermail.io',
  'crazymailing.com',
]);

const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.co': 'gmail.com',
  'gmai.co': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahu.com': 'yahoo.com',
  'yaho.in': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'ootlook.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'icld.com': 'icloud.com',
  'iclod.com': 'icloud.com',
  'iclou.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'redifmail.com': 'rediffmail.com',
  'redif.com': 'rediffmail.com',
  'protomail.com': 'protonmail.com',
  'protom.com': 'protonmail.com',
};

const RECOGNIZED_PROVIDERS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'zoho.com',
  'proton.me',
  'protonmail.com',
  'fastmail.com',
]);

/**
 * Validates whether an email string is structurally sound, valid, and free of typos.
 */
export function validateEmailFormat(rawEmail: string): EmailValidationResult {
  const email = (rawEmail || '').trim();

  if (!email) {
    return {
      isValid: false,
      status: 'empty',
      message: 'Please enter an email address.',
    };
  }

  // Check for spaces
  if (/\s/.test(email)) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Email address cannot contain spaces.',
    };
  }

  // Check for exactly one '@' symbol
  const atCount = (email.match(/@/g) || []).length;
  if (atCount === 0) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Missing "@" symbol in email address.',
    };
  }
  if (atCount > 1) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Email address contains more than one "@" symbol.',
    };
  }

  const [localPart, domainPart] = email.split('@');

  // Check local part (before @)
  if (!localPart) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Email is missing the username before "@".',
    };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Username cannot start or end with a period "."',
    };
  }

  if (localPart.includes('..')) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Username cannot contain consecutive periods ".."',
    };
  }

  // Check domain part (after @)
  if (!domainPart) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Email is missing the domain after "@" (e.g. gmail.com).',
    };
  }

  if (!domainPart.includes('.')) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Email domain is missing a top-level extension (e.g. .com, .org, .edu).',
    };
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Domain name cannot start or end with a period "."',
    };
  }

  if (domainPart.includes('..')) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Domain name cannot contain consecutive periods ".."',
    };
  }

  // Validate Top Level Domain (TLD)
  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Invalid domain extension (must be at least 2 letters, e.g. .com, .in).',
    };
  }

  // General RFC regex check
  const rfcRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcRegex.test(email)) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Email format is invalid according to standard RFC standards.',
    };
  }

  const lowerDomain = domainPart.toLowerCase();

  // Check for disposable domains
  if (DISPOSABLE_DOMAINS.has(lowerDomain)) {
    return {
      isValid: false,
      status: 'invalid',
      isDisposable: true,
      message: 'Disposable or temporary email services are not permitted. Please use a permanent email.',
    };
  }

  // Check for common typo suggestions
  if (COMMON_DOMAIN_TYPOS[lowerDomain]) {
    const correctedDomain = COMMON_DOMAIN_TYPOS[lowerDomain];
    const suggestedCorrection = `${localPart}@${correctedDomain}`;
    return {
      isValid: false,
      status: 'warning',
      message: `Did you mean @${correctedDomain}?`,
      suggestedCorrection,
      domain: lowerDomain,
      localPart,
    };
  }

  const isRecognized = RECOGNIZED_PROVIDERS.has(lowerDomain);

  return {
    isValid: true,
    status: 'valid',
    message: isRecognized ? 'Valid verified email provider.' : 'Valid email format.',
    isRecognizedProvider: isRecognized,
    domain: lowerDomain,
    localPart,
  };
}

/**
 * Generates a random 6-digit security code for verification
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
