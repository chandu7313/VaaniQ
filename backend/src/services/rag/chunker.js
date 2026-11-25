// Splits a document into retrieval chunks along markdown headings, so every chunk
// knows which section it came from (used for source attribution).
const MAX_WORDS = 110;

const INJECTION_PATTERNS = [
  /ignore (all |any )?(previous|prior|above) (instructions|prompts)/i,
  /disregard (the )?(system|previous) (prompt|instructions)/i,
  /you are now\b/i,
  /system prompt/i,
  /reveal (your|the) (instructions|prompt|api key)/i,
];

export const looksLikeInjection = (text) => INJECTION_PATTERNS.some((re) => re.test(text));

export function chunkDocument(title, content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let current = { section: title, lines: [] };
  for (const line of lines) {
    const h = /^#{1,3}\s+(.*)$/.exec(line);
    if (h) {
      if (current.lines.join('').trim()) sections.push(current);
      current = { section: h[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join('').trim()) sections.push(current);

  const chunks = [];
  for (const { section, lines: secLines } of sections) {
    // Pack whole lines into chunks up to MAX_WORDS; a line is never split mid-sentence.
    let buf = [];
    let words = 0;
    const flush = () => {
      if (!buf.length) return;
      const text = buf.join('\n').trim();
      chunks.push({ section, content: text, flagged: looksLikeInjection(text) });
      buf = []; words = 0;
    };
    for (const line of secLines.map((l) => l.trim()).filter(Boolean)) {
      const n = line.split(/\s+/).length;
      if (words + n > MAX_WORDS) flush();
      buf.push(line); words += n;
    }
    flush();
  }
  return chunks.map((c, i) => ({ ...c, chunkIndex: i }));
}
