import { clsx, type ClassValue } from 'clsx';
import JSBI from 'jsbi';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function verifyCaptcha(token: string) {
  if (!token) {
    console.error('reCAPTCHA token is missing');
    return false;
  }

  console.log('Verifying reCAPTCHA token:', {
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 10) + '...', // Log first 10 chars for debugging
    timestamp: new Date().toISOString(), // When verification attempt started
  });

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      console.error('reCAPTCHA API response not ok:', {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    const data = await response.json();

    console.log('reCAPTCHA API response:', {
      success: data.success,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      raw_timestamp: data.challenge_ts,
      challenge_age: data.challenge_ts
        ? Math.round(
            (new Date().getTime() - new Date(data.challenge_ts).getTime()) /
              1000
          ) + ' seconds'
        : 'invalid timestamp',
    });

    return data.success && data.score >= 0.5; // Adjust threshold as needed
  } catch (error) {
    console.error('reCAPTCHA verification error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

export function encodePriceSqrt(reserve1: number, reserve0: number): JSBI {
  const numerator = JSBI.BigInt(reserve1);
  const denominator = JSBI.BigInt(reserve0);
  const ratioX96 = JSBI.multiply(
    JSBI.BigInt(2 ** 96),
    JSBI.divide(numerator, denominator)
  );
  return JSBI.divide(JSBI.BigInt(ratioX96), JSBI.BigInt(2));
}
