import { useState } from 'react';
import { CheckCircle2, XCircle, CircleHelp, Volume2, ShieldCheck, LogOut, PlugZap } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSpeechSynthesis, useSpeechRecognition, useMicPermission } from '../hooks/useSpeech';
import { Badge, Button, Card, Field, PageHeader, inputCls, cx } from '../components/ui';
import { BCP47, LANG_LABEL, LANG_NAME } from '../lib/format';

const SAMPLE = {
  en: 'Hello, this is VaaniQ. Your site visit is confirmed for Saturday at 11 AM.',
  hi: 'नमस्ते, मैं VaaniQ हूँ। आपकी साइट विजिट शनिवार सुबह 11 बजे के लिए पक्की है।',
  te: 'నమస్తే, నేను VaaniQ. మీ సైట్ విజిట్ శనివారం ఉదయం 11 గంటలకు నిర్ధారించబడింది.',
};

const Check = ({ ok, unknown, children }) => (
  <div className="flex items-center gap-2 text-sm">
    {unknown ? <CircleHelp className="size-4 text-slate-500" /> : ok ? <CheckCircle2 className="size-4 text-emerald-400" /> : <XCircle className="size-4 text-rose-400" />}
    <span className={cx(ok || unknown ? 'text-slate-200' : 'text-slate-400')}>{children}</span>
  </div>
);

export default function Settings() {
  const { user, meta, logout } = useAuth();
  const { settings, update, reset } = useSettings();
  const tts = useSpeechSynthesis();
  const stt = useSpeechRecognition({ lang: BCP47[settings.language], onFinal: () => {} });
  const permission = useMicPermission();

  const [llm, setLlm] = useState({ loading: false, result: null });
  const checkLlm = async () => {
    setLlm({ loading: true, result: null });
    try { setLlm({ loading: false, result: { ok: true, ...(await api('/llm/health')) } }); } catch (err) { setLlm({ loading: false, result: { ok: false, message: err.message } }); }
  };
  const test = (lang) => tts.speak(SAMPLE[lang], BCP47[lang], { voiceURI: settings.voices[lang], rate: settings.rate });

  return (
    <div className="max-w-5xl">
      <PageHeader title="Settings & Language" description="Voice and language preferences for this browser, a live check of what this browser supports, and the workspace configuration."
        actions={<Button variant="secondary" onClick={reset}>Reset to defaults</Button>} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Language & voice" subtitle="Saved in this browser only">
          <div className="space-y-4">
            <Field label="Default conversation language">
              <div className="flex rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Default language">
                {Object.entries(LANG_LABEL).map(([k, label]) => (
                  <button key={k} type="button" aria-pressed={settings.language === k} onClick={() => update({ language: k })}
                    className={cx('flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors', settings.language === k ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200')}>
                    {label} <span className="opacity-60">{BCP47[k]}</span>
                  </button>
                ))}
              </div>
            </Field>
            {Object.keys(LANG_LABEL).map((lang) => {
              const options = tts.voicesFor(BCP47[lang]);
              return (
                <Field key={lang} label={`${LANG_NAME[lang]} voice (${BCP47[lang]})`} hint={options.length ? `${options.length} voice(s) installed in this browser` : `No ${LANG_NAME[lang]} voice is installed: replies in ${LANG_NAME[lang]} are shown as text only. Install one in your operating system's speech settings.`}>
                  <div className="flex gap-2">
                    <select className={inputCls} value={settings.voices[lang]} disabled={!options.length} onChange={(e) => update({ voices: { [lang]: e.target.value } })} aria-label={`${LANG_NAME[lang]} voice`}>
                      <option value="">Automatic (best match)</option>
                      {options.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}{v.localService ? '' : ' · online'}</option>)}
                    </select>
                    <Button variant="secondary" disabled={!tts.supported || !options.length} onClick={() => test(lang)} aria-label={`Test ${LANG_NAME[lang]} voice`}><Volume2 className="size-4" />Test</Button>
                  </div>
                </Field>
              );
            })}
            <Field label={`Speaking rate: ${settings.rate.toFixed(1)}×`}>
              <input type="range" min="0.7" max="1.3" step="0.1" value={settings.rate} onChange={(e) => update({ rate: Number(e.target.value) })} className="w-full accent-indigo-500" aria-label="Speaking rate" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={settings.autoSpeak} onChange={(e) => update({ autoSpeak: e.target.checked })} className="size-4 accent-indigo-500" />
              Speak AI replies automatically (you can still replay any reply)
            </label>
          </div>
        </Card>

        <Card title="This browser's voice capabilities" subtitle="Detected live; nothing is assumed">
          <div className="space-y-2.5">
            <Check ok={stt.supported}>Speech-to-text (Web Speech recognition){!stt.supported && ': use Chrome or Edge, or type'}</Check>
            <Check ok={permission === 'granted'} unknown={permission === 'unknown' || permission === 'prompt'}>
              Microphone permission: {permission === 'unknown' ? 'not reported by this browser (it will ask when you press the mic)' : permission === 'prompt' ? 'will be requested on first use' : permission}
            </Check>
            <Check ok={tts.supported}>Text-to-speech (speechSynthesis)</Check>
            {Object.keys(LANG_LABEL).map((lang) => (
              <Check key={lang} ok={tts.hasVoice(BCP47[lang])}>{LANG_NAME[lang]} voice: {tts.hasVoice(BCP47[lang]) ? `${tts.voicesFor(BCP47[lang]).length} available` : 'not installed (text only)'}</Check>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-slate-500">Recognition quality for Hindi and Telugu depends on the browser's speech service. Sentiment is computed from the transcript text, not from voice tone.</p>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-100">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />No voice recordings are made or stored. Only the recognised text is sent to the VaaniQ server. In Chrome, recognition itself is processed by the browser vendor's speech service.
          </div>
        </Card>

        <Card title="Workspace" subtitle="Read from the server (/api/meta)">
          {!meta ? <p className="text-sm text-slate-500">Loading…</p> : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Company</dt><dd className="text-right text-slate-200">{meta.tenant.name} {meta.tenant.isDemo && <Badge tone="amber">DEMO</Badge>}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">AI mode</dt><dd className="text-right">{meta.demoMode ? <Badge tone="amber">DEMO_MODE · rule-based</Badge> : <Badge tone="green">{meta.provider}</Badge>}</dd></div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button size="sm" variant="secondary" loading={llm.loading} onClick={checkLlm}><PlugZap className="size-3.5" />Test AI connection</Button>
                {llm.result && (llm.result.ok
                  ? <span className="text-xs text-slate-300">{llm.result.status === 'demo_mode' ? 'DEMO_MODE: no LLM configured (rule-based answers)' : `Connected to ${llm.result.provider} in ${llm.result.latencyMs} ms`}</span>
                  : <span role="alert" className="text-xs text-rose-300">{llm.result.message}</span>)}
              </div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Site-visit hours</dt><dd className="text-right text-slate-200">{meta.tenant.booking.startHour}:00 to {meta.tenant.booking.endHour}:00 IST, Mon to Sat, {meta.tenant.booking.slotMinutes}-min slots</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Booking window</dt><dd className="text-right text-slate-200">{meta.tenant.booking.minLeadHours} h ahead to {meta.tenant.booking.daysAhead} days</dd></div>
              <div><dt className="mb-1 text-slate-500">Lead scoring weights</dt><dd className="flex flex-wrap gap-1.5">{Object.entries(meta.tenant.scoring.weights).map(([k, v]) => <Badge key={k}>{k} {v}</Badge>)}<Badge tone="red">hot ≥ {meta.tenant.scoring.thresholds.hot}</Badge><Badge tone="amber">warm ≥ {meta.tenant.scoring.thresholds.warm}</Badge></dd></div>
              <div><dt className="mb-1 text-slate-500">Agent tools ({meta.tools.length})</dt><dd className="flex flex-wrap gap-1.5">{meta.tools.map((t) => <Badge key={t.name} tone={t.sideEffect === 'write' ? 'amber' : 'slate'} title={t.description}>{t.name}{t.requiresConfirmation ? ' · consent' : ''}</Badge>)}</dd></div>
            </dl>
          )}
        </Card>

        <Card title="Account">
          <div className="space-y-1 text-sm">
            <div className="text-slate-200">{user?.full_name}</div>
            <div className="text-slate-400">{user?.email}</div>
            <div><Badge tone="indigo">{user?.role}</Badge></div>
          </div>
          <Button variant="secondary" className="mt-4" onClick={logout}><LogOut className="size-4" />Sign out</Button>
        </Card>
      </div>
    </div>
  );
}
