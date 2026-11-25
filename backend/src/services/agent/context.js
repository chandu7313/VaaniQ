// Context retrieval for follow-up questions.
// "How big are they?" has no topic words of its own; BM25 needs the topic from earlier turns.
// We add only facts already in memory: the customer's stated configuration and the section the
// previous answer came from. Nothing is inferred.

const FOLLOW_UP = /\b(it|its|they|them|their|those|these|that|this one|what about|how about|and the|also|same)\b|(वो|वह|उसका|उसकी|इसका|इसकी|अदि|అది|దాని|వాటి|ఇది)/iu;

/** True when the message refers back to something said earlier ("they", "it", "what about"). */
export function isFollowUp(text) {
  return FOLLOW_UP.test(text);
}

/**
 * @returns {{ query: string, contextual: boolean, added: string[] }}
 * `added` is recorded in the decision trace so the expansion is auditable.
 */
export function buildRetrievalQuery({ text, searchQuery, profile = {}, lastTopic }) {
  const base = searchQuery || text;
  // Expand only for genuine references back: a new self-contained question like
  // "Is there parking?" must not be dragged back to the old topic.
  if (!isFollowUp(text)) return { query: base, contextual: false, added: [] };
  const added = [];
  if (lastTopic?.section) added.push(lastTopic.section);
  if (profile.bedrooms && !/\d\s*bhk/i.test(text)) added.push(`${profile.bedrooms}BHK`);
  return { query: added.length ? `${base} ${added.join(' ')}` : base, contextual: added.length > 0, added };
}
