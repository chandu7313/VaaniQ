import { useState } from 'react';
import { CheckCircle2, XCircle, CircleHelp, Volume2, ShieldCheck, LogOut, PlugZap, Sun, Moon } from 'lucide-react';
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
  <div className="flex items-center gap-3 py-1.5 text-sm">
    {unknown ? (
      <CircleHelp className="size-4.5 shrink-0 text-ink-muted" />
    ) : ok ? (
      <CheckCircle2 className="size-4.5 shrink-0 text-success" />
    ) : (
      <XCircle className="size-4.5 shrink-0 text-danger" />
    )}
    <span className={cx(ok || unknown ? 'font-medium text-ink' : 'text-ink-2')}>{children}</span>
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
    try {
      setLlm({ loading: false, result: { ok: true, ...(await api('/llm/health')) } });
    } catch (err) {
      setLlm({ loading: false, result: { ok: false, message: err.message } });
    }
  };

  const test = (lang) =>
    tts.speak(SAMPLE[lang], BCP47[lang], { voiceURI: settings.voices[lang], rate: settings.rate });

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Workspace & Audio"
        title="Settings & Language"
        description="Manage appearance theme, browser voice synthesis preferences, hardware speech capabilities, and live workspace AI connectivity."
        actions={
          <Button variant="secondary" onClick={reset}>
            Reset to defaults
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Appearance & language" subtitle="Saved locally in this browser">
          <div className="space-y-5">
            <Field label="Interface color theme">
              <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Interface theme">
                {[
                  ['light', 'Light + Dark Contrast', Sun],
                  ['dark', 'Dark Mode', Moon],
                ].map(([mode, label, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={settings.theme === mode}
                    onClick={() => update({ theme: mode })}
                    className={cx(
                      'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                      settings.theme === mode
                        ? 'border-brand bg-brand-soft text-brand-deep'
                        : 'border-line bg-surface-2 text-ink-2 hover:text-ink',
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Default conversation language">
              <div
                className="flex rounded-lg border border-line bg-surface-2 p-1"
                role="group"
                aria-label="Default language"
              >
                {Object.entries(LANG_LABEL).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={settings.language === k}
                    onClick={() => update({ language: k })}
                    className={cx(
                      'flex-1 cursor-pointer rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                      settings.language === k
                        ? 'bg-surface text-brand-deep shadow-[var(--shadow-card)]'
                        : 'text-ink-2 hover:text-ink',
                    )}
                  >
                    {label} <span className="font-mono text-xs opacity-65">{BCP47[k]}</span>
                  </button>
                ))}
              </div>
            </Field>

            {Object.keys(LANG_LABEL).map((lang) => {
              const options = tts.voicesFor(BCP47[lang]);
              return (
                <Field
                  key={lang}
                  label={`${LANG_NAME[lang]} voice (${BCP47[lang]})`}
                  hint={
                    options.length
                      ? `${options.length} voice(s) installed in this browser`
                      : `No ${LANG_NAME[lang]} voice installed: replies in ${LANG_NAME[lang]} are displayed as text only.`
                  }
                >
                  <div className="flex gap-2.5">
                    <select
                      className={inputCls}
                      value={settings.voices[lang]}
                      disabled={!options.length}
                      onChange={(e) => update({ voices: { [lang]: e.target.value } })}
                      aria-label={`${LANG_NAME[lang]} voice`}
                    >
                      <option value="">Automatic (best match)</option>
                      {options.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} · {v.lang}
                          {v.localService ? '' : ' · online'}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      disabled={!tts.supported || !options.length}
                      onClick={() => test(lang)}
                      aria-label={`Test ${LANG_NAME[lang]} voice`}
                    >
                      <Volume2 className="size-4" />
                      Test
                    </Button>
                  </div>
                </Field>
              );
            })}

            <Field label={`Speaking rate: ${settings.rate.toFixed(1)}×`}>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={settings.rate}
                onChange={(e) => update({ rate: Number(e.target.value) })}
                className="w-full accent-brand"
                aria-label="Speaking rate"
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => update({ autoSpeak: e.target.checked })}
                className="size-4.5 rounded border-line-strong accent-brand"
              />
              Speak AI replies automatically (individual messages remain replayable)
            </label>
          </div>
        </Card>

        <Card title="Browser voice diagnostics" subtitle="Detected live from Web Speech APIs">
          <div className="space-y-2">
            <Check ok={stt.supported}>
              Speech-to-text (Web Speech recognition)
              {!stt.supported && ': use Chrome or Edge, or type'}
            </Check>
            <Check ok={permission === 'granted'} unknown={permission === 'unknown' || permission === 'prompt'}>
              Microphone permission:{' '}
              {permission === 'unknown'
                ? 'not reported by browser (prompts on mic activation)'
                : permission === 'prompt'
                  ? 'will be requested on first use'
                  : permission}
            </Check>
            <Check ok={tts.supported}>Text-to-speech (speechSynthesis)</Check>
            {Object.keys(LANG_LABEL).map((lang) => (
              <Check key={lang} ok={tts.hasVoice(BCP47[lang])}>
                {LANG_NAME[lang]} voice:{' '}
                {tts.hasVoice(BCP47[lang])
                  ? `${tts.voicesFor(BCP47[lang]).length} available`
                  : 'not installed (text only)'}
              </Check>
            ))}
            <p className="pt-3 text-[13px] leading-relaxed text-ink-muted">
              Recognition accuracy for Hindi and Telugu depends on browser speech services. Sentiment is computed strictly from transcript text.
            </p>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-success-border bg-success-soft p-3.5 text-[13px] leading-relaxed text-success">
            <ShieldCheck className="mt-0.5 size-4.5 shrink-0" />
            <span>
              No voice audio is recorded or stored by VaaniQ. Only recognised text transcripts are transmitted to the server.
            </span>
          </div>
        </Card>

        <Card title="Workspace configuration" subtitle="Read live from the server (/api/meta)">
          {!meta ? (
            <p className="text-sm text-ink-muted">Loading workspace configuration…</p>
          ) : (
            <dl className="space-y-3.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-ink-2">Company</dt>
                <dd className="flex items-center gap-2 text-right font-medium text-ink">
                  {meta.tenant.name} {meta.tenant.isDemo && <Badge tone="amber">DEMO</Badge>}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-ink-2">AI mode</dt>
                <dd className="text-right">
                  {meta.demoMode ? (
                    <Badge tone="amber">DEMO_MODE · rule-based</Badge>
                  ) : (
                    <Badge tone="green">{meta.provider}</Badge>
                  )}
                </dd>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3.5">
                <Button size="sm" variant="secondary" loading={llm.loading} onClick={checkLlm}>
                  <PlugZap className="size-4" />
                  Test AI connection
                </Button>
                {llm.result &&
                  (llm.result.ok ? (
                    <span className="font-mono text-xs text-ink-2">
                      {llm.result.status === 'demo_mode'
                        ? 'DEMO_MODE: rule-based answers'
                        : `Connected to ${llm.result.provider} (${llm.result.latencyMs} ms)`}
                    </span>
                  ) : (
                    <span role="alert" className="text-[13px] text-danger">
                      {llm.result.message}
                    </span>
                  ))}
              </div>

              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-ink-2">Site-visit hours</dt>
                <dd className="text-right font-mono text-[13px] text-ink">
                  {meta.tenant.booking.startHour}:00–{meta.tenant.booking.endHour}:00 IST, Mon–Sat,{' '}
                  {meta.tenant.booking.slotMinutes}m slots
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-ink-2">Booking window</dt>
                <dd className="text-right font-mono text-[13px] text-ink">
                  {meta.tenant.booking.minLeadHours}h ahead to {meta.tenant.booking.daysAhead}d
                </dd>
              </div>

              <div>
                <dt className="mb-2 text-ink-2">Lead scoring weights</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {Object.entries(meta.tenant.scoring.weights).map(([k, v]) => (
                    <Badge key={k} className="font-mono">
                      {k} {v}
                    </Badge>
                  ))}
                  <Badge tone="red" className="font-mono">
                    hot ≥ {meta.tenant.scoring.thresholds.hot}
                  </Badge>
                  <Badge tone="amber" className="font-mono">
                    warm ≥ {meta.tenant.scoring.thresholds.warm}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="mb-2 text-ink-2">Validated agent tools ({meta.tools.length})</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {meta.tools.map((t) => (
                    <Badge
                      key={t.name}
                      tone={t.sideEffect === 'write' ? 'amber' : 'slate'}
                      title={t.description}
                      className="font-mono"
                    >
                      {t.name}
                      {t.requiresConfirmation ? ' · consent' : ''}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card title="Signed-in account" subtitle="Current authenticated session">
          <div className="space-y-2 text-[15px]">
            <div className="font-semibold text-ink">{user?.full_name}</div>
            <div className="font-mono text-[13px] text-ink-2">{user?.email}</div>
            <div className="pt-1">
              <Badge tone="brand">{user?.role}</Badge>
            </div>
          </div>
          <Button variant="secondary" className="mt-5" onClick={logout}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
