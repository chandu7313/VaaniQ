import { humanRequestPhrases } from './lexicon.js';
import { istParts, istDate, ymd } from '../lib/time.js';

// Deterministic natural-language understanding for EN/HI/TE keywords.
// It is the safety baseline: it always runs, never invents values (absent -> undefined),
// and is the ONLY source of confirm/decline decisions (an LLM can't "confirm" for the customer).

const LOCALITIES = {
  gachibowli: ['gachibowli', 'gachibowly', 'गाचीबोवली', 'गचिबोवली', 'గచ్చిబౌలి'],
  kondapur: ['kondapur', 'కొండాపూర్', 'कोंडापुर'],
  madhapur: ['madhapur', 'మాదాపూర్', 'माधापुर'],
  'hitech city': ['hitech city', 'hi-tech city', 'hitec city', 'హైటెక్ సిటీ'],
  'financial district': ['financial district', 'ఫైనాన్షియల్ డిస్ట్రిక్ట్'],
  kokapet: ['kokapet', 'కోకాపేట్'],
};
const LOC_LABEL = { gachibowli: 'Gachibowli', kondapur: 'Kondapur', madhapur: 'Madhapur', 'hitech city': 'Hitech City', 'financial district': 'Financial District', kokapet: 'Kokapet' };

const WEEKDAYS = [
  ['sunday', 'रविवार', 'ఆదివారం'], ['monday', 'सोमवार', 'సోమవారం'], ['tuesday', 'मंगलवार', 'మంగళవారం'],
  ['wednesday', 'बुधवार', 'బుధవారం'], ['thursday', 'गुरुवार', 'గురువారం'], ['friday', 'शुक्रवार', 'శుక్రవారం'], ['saturday', 'शनिवार', 'శనివారం'],
];
const DAY_AFTER = ['day after tomorrow', 'parso', 'परसों', 'ఎల్లుండి'];
const TOMORROW = ['tomorrow', 'kal ', 'कल', 'రేపు'];
const TODAY = ['today', 'aaj', 'आज', 'ఈరోజు', 'ఈ రోజు'];

const CONFIRM = [/\b(yes|yeah|yep|yup|sure|ok|okay|confirm|confirmed|correct|go ahead|book it|please book|sounds good|that works)\b/i, /(हाँ|हां|ठीक है|कन्फर्म|जी हाँ|पक्का)/, /(అవును|సరే|ఓకే|నిర్ధారించు|బుక్ చేయండి)/];
const DECLINE = [/\b(no|nope|nah|cancel|don't|dont|do not|not now|different time|another time|change it)\b/i, /(नहीं|ना |रद्द|कोई और)/, /(వద్దు|కాదు|లేదు|రద్దు|వేరే)/];
const VISIT = [/\b(site visit|visit|see the (flat|apartment|property|site|project)|arrange.*(visit|tour)|schedule (?:a |the |my )?(?:site )?(?:visit|tour|appointment|meeting)|appointment|tour)\b/i, /(विजिट|देखने|साइट|दौरा)/, /(విజిట్|చూడాలి|సందర్శన|చూడటానికి)/];
const ASK = [/\?/, /\b(what|which|how|tell me|details|information|about|price|cost|rate|amenit|location|possession|loan|rera|parking|available|where|when|does|do you|is there|are there)\b/i,
  /(क्या|कितना|कितनी|बताइए|बताओ|जानकारी|कीमत|सुविधा|कब|कहाँ)/, /(ఏమిటి|ఎంత|చెప్పండి|సమాచారం|ధర|సౌకర్యాలు|ఎప్పుడు|ఎక్కడ)/];
const GREETING = /^\s*(hi|hello|hey|good (morning|afternoon|evening)|namaste|नमस्ते|नमस्कार|నమస్తే|హలో)[\s!.,]*$/i;
const GOODBYE = [/\b(bye|goodbye|that's all|that is all|no more questions|see you)\b/i, /(अलविदा|बस इतना)/, /(వీడ్కోలు|అంతే)/];

const matchesAny = (text, patterns) => patterns.some((re) => re.test(text));
const includesAny = (text, terms) => terms.some((t) => text.includes(t));

/** "90 lakh", "1.2 crore", "Rs 90,00,000", "90 लाख", "కోటి" -> rupees. */
export function parseBudget(text) {
  const t = text.toLowerCase().replace(/,/g, '');
  let m = /(\d+(?:\.\d+)?)\s*(crore|crores|cr\b|करोड़|करोड|కోటి|కోట్లు)/u.exec(t);
  let rupees = m ? Number(m[1]) * 1e7 : null;
  if (rupees == null) {
    m = /(\d+(?:\.\d+)?)\s*(lakhs?|lacs?|lk\b|लाख|లక్షలు|లక్ష)/u.exec(t);
    rupees = m ? Number(m[1]) * 1e5 : null;
  }
  if (rupees == null) {
    m = /(?:₹|rs\.?|inr)\s*(\d{6,9})/.exec(t) || /\b(\d{7,9})\b/.exec(t);
    rupees = m ? Number(m[1]) : null;
  }
  if (rupees == null || rupees < 1e6 || rupees > 5e8) return null; // outside plausible flat prices: don't guess
  return { budgetMax: Math.round(rupees), budgetApprox: /around|approx|about|roughly|के आसपास|సుమారు/.test(t) };
}

function parseTimeline(text) {
  const t = text.toLowerCase();
  const word = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  let m = /(?:within|in|next|after)\s+(?:about\s+)?(\d+|one|two|three|four|five|six)\s+months?/.exec(t);
  if (m) return Number(word[m[1]] ?? m[1]);
  m = /(\d+)\s*(?:महीने|महीना)/.exec(t) || /(\d+)\s*నెల(?:లు|ల్లో)?/.exec(t);
  if (m) return Number(m[1]);
  if (/(next month|within (a|one) month|this month|immediately|asap|right away|next week|अगले महीने|इसी महीने|వచ్చే నెల|ఈ నెల)/.test(t)) return 1;
  if (/(this year|within a year|next year)/.test(t)) return 12;
  return undefined;
}

function parseDecisionMaker(text) {
  const t = text.toLowerCase();
  if (/(wife|husband|spouse|partner|family|parents|discuss with|पत्नी|पति|परिवार|భార్య|భర్త|కుటుంబం)/u.test(t)) return 'joint';
  if (/(my (father|mother|boss|company|employer) (will )?(decide|decides|approve|approves))/.test(t)) return 'other';
  if (/(i (will )?decide|i am the (only )?decision|my (own )?decision|just me|only me|मैं ही|నేనే నిర్ణయ)/u.test(t)) return 'self';
  return undefined;
}

function parsePhone(text) {
  const collapsed = text.replace(/(?<=\d)[\s-]+(?=\d)/g, '');
  const m = /(?<!\d)(?:\+?91)?([6-9]\d{9})(?!\d)/.exec(collapsed);
  return m ? `+91${m[1]}` : undefined;
}

const NOT_NAMES = new Set(['looking', 'planning', 'interested', 'not', 'very', 'a', 'an', 'the', 'just', 'ok', 'okay', 'fine', 'sure', 'from', 'here', 'happy', 'buying', 'calling', 'available', 'free', 'good', 'thinking', 'great', 'nice', 'perfect', 'awesome', 'amazing', 'excellent', 'wonderful', 'too', 'really', 'so', 'expensive', 'costly', 'helpful', 'correct', 'right', 'exactly', 'what', 'it', 'about']);

function parseName(text) {
  let m = /(?:my name is|call me|i am called|मेरा नाम|నా పేరు)\s+(\p{L}[\p{L}\p{M}.'-]*(?:\s+\p{L}[\p{L}\p{M}.'-]*){0,2})/iu.exec(text);
  // "I'm Meera Rao" / "This is Meera": only when the next word is Capitalised and not a common word,
  // so "I am looking for..." and "This is great!" are never taken as names.
  if (!m) {
    const c = /\b(?:I'm|I am|Im|This is|this is)\s+(\p{Lu}[\p{L}\p{M}.'-]*(?:\s+\p{Lu}[\p{L}\p{M}.'-]*){0,2})/u.exec(text);
    if (c && !NOT_NAMES.has(c[1].split(/\s+/)[0].toLowerCase())) m = c;
  }
  if (!m) return undefined;
  // Trim trailing connector words that are not part of a name ("Anil and my number...", "Anil है").
  const name = m[1].split(/\s+/).filter((w) => !/^(and|my|is|है|और|and,|i|from|here|నా|నంబర్|अपना|नंबर)$/i.test(w)).join(' ');
  return name ? name.replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : undefined;
}

function parseDay(text, now) {
  const t = ` ${text.toLowerCase()} `;
  const today = istParts(now);
  const base = istDate(today.year, today.month, today.day);
  const plus = (n) => ymd(new Date(base.getTime() + n * 86400000));
  if (includesAny(t, DAY_AFTER)) return plus(2);
  if (includesAny(t, TOMORROW)) return plus(1);
  if (includesAny(t, TODAY)) return plus(0);
  for (let i = 0; i < 7; i++) {
    if (includesAny(t, WEEKDAYS[i])) {
      let diff = (i - today.weekday + 7) % 7;
      if (diff === 0 && /next/.test(t)) diff = 7;
      return plus(diff);
    }
  }
  return undefined;
}

/** Returns {hour, minute} (24h) when exact, or {daypart} for vague preferences. */
function parseTimeOfDay(text) {
  const t = text.toLowerCase();
  let m = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/.exec(t);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[3].startsWith('p')) h += 12;
    return { hour: h, minute: Number(m[2] || 0) };
  }
  m = /\b([01]?\d|2[0-3]):([0-5]\d)\b/.exec(t);
  if (m) return { hour: Number(m[1]), minute: Number(m[2]) };
  m = /(\d{1,2})\s*(?:बजे|గంటల(?:కు|కి))/u.exec(t) || /\bat\s+(\d{1,2})\b(?!\s*(?:lakh|lac|crore|cr|bhk))/.exec(t);
  if (m) {
    const h = Number(m[1]);
    // Business hours are 10-18: 1-6 can only be pm; 7-9 is ambiguous so we do not guess.
    if (h >= 1 && h <= 6) return { hour: h + 12, minute: 0 };
    if (h >= 10 && h <= 12) return { hour: h, minute: 0 };
    if (h >= 13 && h <= 18) return { hour: h, minute: 0 };
  }
  if (/(morning|सुबह|ఉదయం)/u.test(t)) return { daypart: 'morning' };
  if (/(afternoon|दोपहर|మధ్యాహ్నం)/u.test(t)) return { daypart: 'afternoon' };
  if (/(evening|शाम|సాయంత్రం)/u.test(t)) return { daypart: 'evening' };
  return undefined;
}

function parseOrdinal(text) {
  const t = text.toLowerCase();
  if (/\b(first|1st|option 1|slot 1|number 1)\b|पहला|మొదటి/u.test(t)) return 0;
  if (/\b(second|2nd|option 2|slot 2|number 2)\b|दूसरा|రెండవ/u.test(t)) return 1;
  if (/\b(third|3rd|option 3|slot 3|number 3)\b|तीसरा|మూడవ/u.test(t)) return 2;
  if (/\b(last)\b/.test(t)) return -1;
  return undefined;
}

const dropUndefined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));

export function extractEntities(text, now = new Date()) {
  const t = text.toLowerCase();
  let bedrooms;
  const bhk = /(\d)\s*-?\s*(?:bhk|bedroom|bed room|बीएचके|బీహెచ్కే)/iu.exec(t);
  if (bhk) bedrooms = Number(bhk[1]);
  else {
    const w = /\b(two|three|four|2|3|4)[\s-]*(?:bhk|bedroom)/.exec(t);
    if (w) bedrooms = { two: 2, three: 3, four: 4 }[w[1]] ?? Number(w[1]);
  }
  let location;
  for (const [key, forms] of Object.entries(LOCALITIES)) if (forms.some((f) => t.includes(f.toLowerCase()))) { location = LOC_LABEL[key]; break; }

  let purpose;
  if (/(investment|invest|rental income|निवेश|పెట్టుబడి)/u.test(t)) purpose = 'investment';
  else if (/(to live|self use|self-use|end use|own use|for my family|रहने के लिए|నివసించ)/u.test(t)) purpose = 'self-use';

  const preferences = [];
  if (/parking|पार्किंग|పార్కింగ్/u.test(t)) preferences.push('parking');
  if (/\bgym\b/.test(t)) preferences.push('gym');
  if (/swimming pool|\bpool\b/.test(t)) preferences.push('swimming pool');
  if (/vastu|वास्तु|వాస్తు/u.test(t)) preferences.push('vastu');
  if (/\bschools?\b/.test(t)) preferences.push('schools nearby');
  if (/\bmetro\b/.test(t)) preferences.push('metro access');

  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.exec(text)?.[0];
  const time = parseTimeOfDay(text);
  return dropUndefined({
    bedrooms, location, purpose,
    preferences: preferences.length ? preferences : undefined,
    // An amount in a loan/EMI question ("EMI for a 70 lakh loan") is a loan amount, not the customer's budget.
    ...(/\b(loan|emi)\b/i.test(text) && !/budget|afford|spend/i.test(text) ? {} : parseBudget(text)),
    timelineMonths: parseTimeline(text),
    decisionMaker: parseDecisionMaker(text),
    fullName: parseName(text),
    phone: parsePhone(text),
    email,
    visitDate: parseDay(text, now),
    visitHour: time?.hour, visitMinute: time?.hour !== undefined ? time.minute : undefined,
    visitDaypart: time?.daypart,
  });
}

/**
 * @param ctx {hasPending: boolean, offeredSlots: any[]} conversation state that gives short words ("yes") meaning.
 */
export function analyzeMessage(text, ctx = {}, now = new Date()) {
  const entities = extractEntities(text, now);
  const words = text.trim().split(/\s+/).length;
  const flags = [];

  if (includesAny(text.toLowerCase(), humanRequestPhrases)) flags.push('human_request');
  // Confirm/decline only count when something is actually awaiting confirmation.
  if (ctx.hasPending) {
    if (matchesAny(text, DECLINE) && !/\b(yes|okay|ok)\b/i.test(text)) flags.push('decline');
    else if (matchesAny(text, CONFIRM)) flags.push('confirm');
  }
  const ordinal = ctx.offeredSlots?.length ? parseOrdinal(text) : undefined;
  if (ordinal !== undefined) { entities.slotChoice = ordinal; flags.push('select_slot'); }
  const slotPref = entities.visitDate || entities.visitHour !== undefined || entities.visitDaypart;
  if (slotPref && !flags.includes('select_slot')) flags.push('slot_preference');
  if (matchesAny(text, VISIT)) flags.push('request_visit');
  if (matchesAny(text, ASK) && !(words <= 3 && flags.includes('confirm'))) flags.push('ask_info');
  const informative = Object.keys(entities).some((k) => !['visitDate', 'visitHour', 'visitMinute', 'visitDaypart', 'slotChoice'].includes(k));
  if (informative) flags.push('provide_info');
  if (GREETING.test(text)) flags.push('greeting');
  if (matchesAny(text, GOODBYE)) flags.push('goodbye');

  const order = ['human_request', 'confirm', 'decline', 'select_slot', 'request_visit', 'slot_preference', 'ask_info', 'provide_info', 'greeting', 'goodbye'];
  const intent = order.find((i) => flags.includes(i)) ?? 'other';
  return { intent, secondary: flags.filter((f) => f !== intent), entities, source: 'rules' };
}

