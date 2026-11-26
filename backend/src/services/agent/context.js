// Context retrieval for follow-up questions.
// "How big are they?" has no topic words of its own; BM25 needs the topic from earlier turns.
// We add only facts already in memory: the customer's stated configuration and the section the
// previous answer came from. Nothing is inferred.

const FOLLOW_UP = /\b(it|its|they|them|their|those|these|that|this one|what about|how about|and the|also|same)\b|(वो|वह|उसका|उसकी|इसका|इसकी|अदि|అది|దాని|వాటి|ఇది)/iu;
const SELF_CONTAINED_UNIT = /\b(?:[23]\s*bhk|two\s+bedroom|three\s+bedroom)\b/i;
const BOILERPLATE_TOPIC = /^(?:[125689]|10)\.\s*(?:purpose|business context|important conditions|exceptions|what the ai|escalation)|important conditions|exceptions/i;

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
  // Expand only for genuine references back: a self-contained question naming a unit ("looking for a 2BHK,
  // tell me about it") or a standalone question ("Is there parking?") must not pull the prior turn's section.
  if (!isFollowUp(text) || SELF_CONTAINED_UNIT.test(text)) return { query: base, contextual: false, added: [] };
  const added = [];
  if (lastTopic?.section && !BOILERPLATE_TOPIC.test(lastTopic.section)) added.push(lastTopic.section);
  else if (lastTopic?.title) added.push(lastTopic.title);
  if (profile.bedrooms && !/\d\s*bhk/i.test(text)) added.push(`${profile.bedrooms}BHK`);
  return { query: added.length ? `${base} ${added.join(' ')}` : base, contextual: added.length > 0, added };
}
