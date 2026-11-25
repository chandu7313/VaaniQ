// Minimal BM25 (Okapi) implementation. No external dependency; ~50 lines of ranking logic.
const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'am', 'was', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'with', 'me', 'my', 'i', 'you', 'it', 'about', 'can', 'tell', 'do', 'does', 'have', 'has', 'what', 'which', 'this', 'that', 'be', 'by', 'from', 'as', 'please', 'any', 'there', 'how', 'will']);

export function tokenize(text) {
  const t = text.toLowerCase().replace(/(\d)\s*bhk/g, '$1bhk').replace(/₹/g, ' rs ');
  return (t.match(/[\p{L}\p{N}\p{M}]+/gu) || [])
    .filter((w) => !STOP.has(w))
    .map(stem);
}

/**
 * Light suffix stemmer applied identically to documents and queries, so
 * price/prices/priced/pricing -> "pric", amenities/amenity -> "amenity", visits/visiting -> "visit".
 * Non-Latin scripts pass through unchanged.
 */
export function stem(w) {
  if (!/^[a-z]+$/.test(w) || w.length <= 3) return w;
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  let s = w;
  if (s.length > 5 && s.endsWith('ing')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
  else if (s.length > 4 && s.endsWith('es')) s = s.slice(0, -2);
  else if (s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  if (s.length > 4 && s.endsWith('e')) s = s.slice(0, -1);
  return s;
}

export class BM25 {
  constructor(docs, { k1 = 1.5, b = 0.75 } = {}) {
    this.k1 = k1; this.b = b;
    this.docs = docs.map((d) => {
      const tokens = tokenize(d.text);
      const tf = new Map();
      for (const tok of tokens) tf.set(tok, (tf.get(tok) || 0) + 1);
      return { id: d.id, len: tokens.length, tf };
    });
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / (this.docs.length || 1) || 1;
    this.df = new Map();
    for (const d of this.docs) for (const tok of d.tf.keys()) this.df.set(tok, (this.df.get(tok) || 0) + 1);
  }

  idf(term) {
    const n = this.df.get(term) || 0;
    return Math.log(1 + (this.docs.length - n + 0.5) / (n + 0.5));
  }

  /** Returns [{id, score, relevance}] sorted desc. relevance = score / best attainable score (0..1). */
  search(query, k = 4) {
    const terms = [...new Set(tokenize(query))];
    if (!terms.length) return [];
    const ceiling = terms.reduce((s, t) => s + (this.df.has(t) ? this.idf(t) * (this.k1 + 1) : 0), 0);
    if (!ceiling) return [];
    const results = [];
    for (const d of this.docs) {
      let score = 0;
      for (const t of terms) {
        const f = d.tf.get(t);
        if (!f) continue;
        score += this.idf(t) * ((f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * d.len) / this.avgLen)));
      }
      if (score > 0) results.push({ id: d.id, score, relevance: Math.min(1, score / ceiling) });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, k);
  }
}
