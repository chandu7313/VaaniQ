import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage, extractEntities, parseBudget } from '../src/services/nlu.js';
import { analyzeSentiment } from '../src/services/sentiment.js';
import { scoreLead } from '../src/services/leadScoring.js';
import { demoTenantSettings } from '../src/db/seedData.js';

const NOW = new Date('2026-11-25T06:00:00Z'); // Wednesday 11:30 IST
const SCENARIO = 'I am looking for a 3BHK apartment in Gachibowli. My budget is around ₹90 lakhs. I am planning to purchase within the next month. Can you tell me about the project and arrange a site visit?';

test('scenario: extracts requirements without inventing missing fields', () => {
  const e = extractEntities(SCENARIO, NOW);
  assert.equal(e.bedrooms, 3);
  assert.equal(e.location, 'Gachibowli');
  assert.equal(e.budgetMax, 9000000);
  assert.equal(e.budgetApprox, true);
  assert.equal(e.timelineMonths, 1);
  assert.equal(e.decisionMaker, undefined);
  assert.equal(e.fullName, undefined);
  assert.equal(e.phone, undefined);
});

test('scenario: visit request is the primary intent and info request is secondary', () => {
  const a = analyzeMessage(SCENARIO, {}, NOW);
  assert.equal(a.intent, 'request_visit');
  assert.ok(a.secondary.includes('ask_info'));
  assert.ok(a.secondary.includes('provide_info'));
});

test('budget parsing across units and languages', () => {
  assert.equal(parseBudget('1.2 crore').budgetMax, 12000000);
  assert.equal(parseBudget('बजट 90 लाख है').budgetMax, 9000000);
  assert.equal(parseBudget('బడ్జెట్ 85 లక్షలు').budgetMax, 8500000);
  assert.equal(parseBudget('Rs 90,00,000').budgetMax, 9000000);
  assert.equal(parseBudget('I have 3 kids'), null);
});

test('contact details, day and time parsing', () => {
  const e = extractEntities('My name is anil kumar and my number is 98765 43210. Saturday at 11 am works', NOW);
  assert.equal(e.fullName, 'Anil Kumar');
  assert.equal(e.phone, '+919876543210');
  assert.equal(e.visitDate, '2026-11-28');
  assert.equal(e.visitHour, 11);
});

test('confirm/decline only recognised when something is pending', () => {
  assert.equal(analyzeMessage('yes', { hasPending: false }).intent, 'other');
  assert.equal(analyzeMessage('yes please', { hasPending: true }).intent, 'confirm');
  assert.equal(analyzeMessage('हाँ ठीक है', { hasPending: true }).intent, 'confirm');
  assert.equal(analyzeMessage('no, a different time', { hasPending: true }).intent, 'decline');
});

test('human escalation request is detected', () => {
  assert.equal(analyzeMessage('I want to talk to a human').intent, 'human_request');
});

test('sentiment: positive, negative, negated and neutral with evidence', () => {
  assert.equal(analyzeSentiment('This sounds great, thank you').label, 'positive');
  const neg = analyzeSentiment('That is too expensive, I am disappointed');
  assert.equal(neg.label, 'negative');
  assert.ok(neg.evidence.some((e) => e.phrase === 'disappointed'));
  assert.equal(analyzeSentiment('I am not interested').label, 'negative');
  assert.equal(analyzeSentiment('not happy with the price').label, 'negative');
  const neutral = analyzeSentiment('I need a 3BHK');
  assert.equal(neutral.label, 'neutral');
  assert.equal(neutral.evidence.length, 0);
  assert.equal(analyzeSentiment('यह बहुत अच्छा है').label, 'positive');
  assert.equal(analyzeSentiment('ధర చాలా ఖరీదు ఎక్కువ').label, 'negative');
});

test('lead score for the scenario is explainable and lists missing info', () => {
  const p = { ...extractEntities(SCENARIO, NOW), visitIntent: 'requested' };
  const s = scoreLead(p, { catalog: demoTenantSettings.catalog, scoring: demoTenantSettings.scoring });
  const f = Object.fromEntries(s.factors.map((x) => [x.key, x.points]));
  assert.deepEqual(f, { budget: 25, requirements: 17, timeline: 20, authority: 0, appointment: 12 });
  assert.equal(s.total, 74);
  assert.equal(s.classification, 'warm');
  assert.ok(s.missing.includes('decisionMaker'));
  assert.match(s.factors[0].reason, /3BHK range ₹88–115 lakh/);
});

test('empty profile scores 0 and booking adds full appointment points', () => {
  const s0 = scoreLead({}, { catalog: demoTenantSettings.catalog });
  assert.equal(s0.total, 0);
  const s1 = scoreLead({}, { catalog: demoTenantSettings.catalog, hasBooking: true });
  assert.equal(s1.total, 15);
});

test('budget below range earns partial points', () => {
  const s = scoreLead({ bedrooms: 3, budgetMax: 8000000 }, { catalog: demoTenantSettings.catalog });
  assert.equal(s.factors[0].points, 18); // 80L is 9% below 88L
});

test('"I\'m <Name>" is a name, "I am looking" is not (regression)', () => {
  assert.equal(extractEntities("The second one. I'm Meera Rao, 9988776655").fullName, 'Meera Rao');
  assert.equal(extractEntities('I am looking for a flat').fullName, undefined);
  assert.equal(extractEntities('I am Planning to buy').fullName, undefined);
});

test('Hindi and Telugu names keep their vowel signs (regression)', () => {
  assert.equal(extractEntities('मेरा नाम राहुल है, नंबर 9876501234').fullName, 'राहुल');
  assert.equal(extractEntities('నా పేరు సురేష్').fullName, 'సురేష్');
});

test('"This is great!" is not a name, "This is Priya" is (regression)', () => {
  assert.equal(extractEntities('My wife and I will decide together. Is there a swimming pool? This is great!').fullName, undefined);
  assert.equal(extractEntities('This is Priya Sharma calling').fullName, 'Priya Sharma');
  assert.equal(extractEntities('this is too expensive').fullName, undefined);
});

test('every factor lists its evidence; no evidence means no points; next action is recommended', () => {
  const p = { ...extractEntities(SCENARIO, NOW), visitIntent: 'requested' };
  const s = scoreLead(p, { catalog: demoTenantSettings.catalog, scoring: demoTenantSettings.scoring });
  const by = Object.fromEntries(s.factors.map((f) => [f.key, f]));
  assert.deepEqual(by.budget.evidence.map((e) => e.field), ['budgetMax', 'priceRangeLakh']);
  assert.equal(by.budget.evidence[1].value, '3BHK 88-115');
  assert.deepEqual(by.requirements.evidence.map((e) => e.field), ['bedrooms', 'location']);
  assert.deepEqual(by.authority.evidence, []);
  assert.equal(by.authority.points, 0);
  for (const f of s.factors) assert.ok(f.points === 0 || f.evidence.length > 0, f.key);
  assert.deepEqual(s.recommendedNextAction, { type: 'collect_information', field: 'decisionMaker', text: 'Ask for the decision-maker.' });
  const booked = scoreLead(p, { catalog: demoTenantSettings.catalog, hasBooking: true });
  assert.equal(booked.recommendedNextAction.type, 'prepare_visit');
  assert.ok(booked.factors.find((f) => f.key === 'appointment').evidence.some((e) => e.field === 'confirmedVisit'));
});

test('sentiment declares it is transcript-text based, not voice emotion', () => {
  assert.equal(analyzeSentiment('This is great').basis, 'transcript_text');
});
