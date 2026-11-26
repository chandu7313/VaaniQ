// Minimal BM25 (Okapi) implementation. No external dependency; ~50 lines of ranking logic.
const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'am', 'was', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'with', 'me', 'my', 'i', 'you', 'it', 'about', 'can', 'tell', 'do', 'does', 'have', 'has', 'what', 'which', 'this', 'that', 'be', 'by', 'from', 'as', 'please', 'any', 'there', 'how', 'will',
  // conversational filler that otherwise matches incidental words in documents ("described here")
  'here', 'also', 'would', 'could', 'should', 'get', 'want', 'need', 'know', 'our', 'your', 'we', 'us', 'they', 'them', 'it', 'its', 'so', 'just', 'like', 'some', 'tell', 'give',
  // buying-conversation filler: says nothing about WHICH document is relevant
  'look', 'looking', 'around', 'purchase', 'purchasing', 'buy', 'buying', 'next', 'arrange', 'plan', 'planning', 'big', 'much', 'many',
  'sell', 'show', 'see', 'budget', 'when', 'where', 'why', 'who', 'whom', 'each', 'every', 'ok', 'okay', 'hi', 'hello', 'thanks', 'thank', 'yes', 'no', 'kindly', 'may', 'might', 'there', 'their', 'am', 'i']);

export function tokenize(text) {
  const t = text.toLowerCase()
    // "three bedroom", "3 bed room", "3-bhk" all normalise to the token used in documents: "3bhk"
    .replace(/\b(two|three|four|[2-4])[\s-]*(?:bhk|bed\s?rooms?|bedroom)\b/g, (_, n) => `${({ two: 2, three: 3, four: 4 })[n] ?? n}bhk`)
    .replace(/(\d)\s*bhk/g, '$1bhk').replace(/₹/g, ' rs ');
  return (t.match(/[\p{L}\p{N}\p{M}]+/gu) || [])
    .filter((w) => !STOP.has(w))
    .map(stem)
    .map((w) => SYNONYMS[w] ?? w);
}

// Everyday words mapped onto the vocabulary the documents use (applied after stemming), so a customer
// saying "flat" or "cost" matches "apartment" or "price" instead of counting as an unknown topic.
const SYNONYMS = {
  flat: 'apartment', home: 'apartment', hous: 'apartment', unit: 'apartment', cost: 'pric', rate: 'pric', rat: 'pric', fee: 'charg',
  elevator: 'lift', kid: 'children', child: 'children',
};

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

  /** True when every content term of the query appears in most chunks (e.g. only the project or company name). */
  isGenericQuery(query) {
    const terms = [...new Set(tokenize(query))].filter((t) => this.df.has(t));
    return terms.length > 0 && terms.every((t) => this.df.get(t) / this.docs.length >= 0.5);
  }

  idf(term) {
    const n = this.df.get(term) || 0;
    return Math.log(1 + (this.docs.length - n + 0.5) / (n + 0.5));
  }

  /** Returns [{id, score, relevance}] sorted desc. relevance = score / best attainable score (0..1). */
  search(query, k = 4) {
    const terms = [...new Set(tokenize(query))];
    if (!terms.length) return [];
    // Relevance ceiling = best score the query could reach. English topic words the knowledge base has
    // never seen ("helipad", "beach", "stock") also count, so an off-topic question cannot look relevant by
    // matching one incidental word ("private"). Numbers and non-Latin words (Hindi/Telugu, whose meaning
    // arrives through query expansion) are not counted: the documents are English.
    const maxIdf = Math.log(1 + (this.docs.length + 0.5) / 0.5);
    const ceiling = terms.reduce((s, t) => {
      if (this.df.has(t)) return s + this.idf(t) * (this.k1 + 1);
      return /^[a-z]+$/.test(t) ? s + maxIdf * (this.k1 + 1) : s;
    }, 0);
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
