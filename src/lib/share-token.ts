/**
 * Token de compartilhamento com assinatura anti-tampering.
 *
 * Payload: { s: score, c: categoria, t: timestamp }
 * Formato final: base64( JSON({ ...payload, h: hash }) )
 *
 * O hash impede que alguém altere o score no base64 e compartilhe
 * um link forjado. Não é criptografia forte (a chave está no JS),
 * mas impede tampering casual.
 */

const SIGN_KEY = 'nfv-ifbb-2024-pose';

export interface ShareTokenPayload {
  s: number;  // score
  c: string;  // categoria
  t: number;  // timestamp (ms)
}

interface SignedPayload extends ShareTokenPayload {
  h: string;  // hash
}

const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function computeHash(payload: ShareTokenPayload): string {
  const data = `${payload.s}|${payload.c}|${payload.t}|${SIGN_KEY}`;
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return (h >>> 0).toString(36);
}

export function encodeShareToken(score: number, categoria: string): string {
  const payload: ShareTokenPayload = {
    s: score,
    c: categoria,
    t: Date.now(),
  };
  const signed: SignedPayload = { ...payload, h: computeHash(payload) };
  return btoa(JSON.stringify(signed));
}

export type DecodeResult =
  | { ok: true; data: ShareTokenPayload }
  | { ok: false; reason: 'invalid' | 'tampered' | 'expired' };

export function decodeShareToken(token: string): DecodeResult {
  try {
    const json = atob(decodeURIComponent(token));
    const parsed: SignedPayload = JSON.parse(json);

    if (
      typeof parsed.s !== 'number' ||
      typeof parsed.c !== 'string' ||
      typeof parsed.t !== 'number' ||
      typeof parsed.h !== 'string'
    ) {
      return { ok: false, reason: 'invalid' };
    }

    const expected = computeHash({ s: parsed.s, c: parsed.c, t: parsed.t });
    if (parsed.h !== expected) {
      return { ok: false, reason: 'tampered' };
    }

    if (Date.now() - parsed.t > EXPIRY_MS) {
      return { ok: false, reason: 'expired' };
    }

    return { ok: true, data: { s: parsed.s, c: parsed.c, t: parsed.t } };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
