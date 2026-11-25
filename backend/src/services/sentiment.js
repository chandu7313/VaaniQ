import { positiveWords, negativeWords, negators } from './lexicon.js';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const flat = (o) => Object.values(o).flat();
const POS = flat(positiveWords).sort((a, b) => b.length - a.length);
const NEG = flat(negativeWords).sort((a, b) => b.length - a.length);
const NEGATORS = flat(negators);

// ASCII terms need word boundaries ("no" must not match "know"); Indic scripts have no \b support.
const termRe = (t) => (/^[\x00-\x7F]+$/.test(t) ? new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, 'iu') : new RegExp(escapeRe(t), 'u'));
const POS_RE = POS.map((t) => [t, termRe(t)]);
const NEG_RE = NEG.map((t) => [t, termRe(t)]);

function findTerms(text, list) {
  let masked = text.toLowerCase();
  const found = [];
  // Longest phrases first; mask each match so "not interested" is not also counted as "interested".
  for (const [term, re] of list) {
    const m = re.exec(masked);
    if (!m) continue;
    found.push({ term, index: m.index });
    masked = masked.slice(0, m.index) + ' '.repeat(term.length) + masked.slice(m.index + term.length);
  }
  return { found, masked };
}

// SCOPE: this classifies the TRANSCRIPT TEXT only. It is not acoustic voice-emotion detection:
// tone, pitch and pauses are never analysed (the browser sends text, and no audio is stored).

/**
 * Lexicon sentiment with negation handling. Deterministic and auditable:
 * evidence is always a phrase that literally occurs in the customer's message.
 */
export function analyzeSentiment(text) {
  const neg = findTerms(text, NEG_RE);
  // Mask negative matches first so shared words ("not interested") are consumed once.
  const pos = findTerms(neg.masked, POS_RE);
  let score = 0;
  const evidence = [];
  for (const f of neg.found) { score -= 1; evidence.push({ phrase: f.term, polarity: 'negative' }); }
  for (const f of pos.found) {
    const before = text.toLowerCase().slice(Math.max(0, f.index - 12), f.index).split(/\s+/);
    const negated = before.some((w) => NEGATORS.includes(w.replace(/[.,!?]/g, '')));
    if (negated) { score -= 1; evidence.push({ phrase: f.term, polarity: 'negative', note: 'negated positive' }); }
    else { score += 1; evidence.push({ phrase: f.term, polarity: 'positive' }); }
  }
  const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  const confidence = evidence.length === 0 ? 0.5 : Math.min(0.95, 0.6 + 0.15 * Math.abs(score));
  return { label, confidence: Number(confidence.toFixed(2)), evidence: evidence.slice(0, 5), method: 'lexicon', basis: 'transcript_text' };
}
