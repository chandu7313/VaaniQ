import { Mic, MicOff, Volume2, VolumeX, Loader2, Radio } from 'lucide-react';
import { Badge, cx } from '../ui';
import { LANG_LABEL } from '../../lib/format';

const STATES = {
  idle: { label: 'Ready', cls: 'bg-slate-500/15 text-slate-300', icon: Radio },
  listening: { label: 'Listening…', cls: 'bg-rose-500/15 text-rose-300', icon: Mic },
  thinking: { label: 'Thinking…', cls: 'bg-amber-500/15 text-amber-300', icon: Loader2 },
  speaking: { label: 'Speaking…', cls: 'bg-emerald-500/15 text-emerald-300', icon: Volume2 },
};
const PERMISSION = { granted: ['green', 'Mic allowed'], denied: ['red', 'Mic blocked'], prompt: ['amber', 'Mic: will ask'], unknown: ['slate', 'Mic permission unknown'] };

/** One line that answers: what is the agent doing now, and what can this browser do for this language? */
export default function VoiceStatus({ state, lang, bcp47, sttSupported, permission, ttsSupported, hasVoice, muted }) {
  const s = STATES[state];
  const Icon = s.icon;
  const [tone, label] = PERMISSION[permission];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span role="status" aria-live="polite" className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors', s.cls)}>
        <Icon className={cx('size-3.5', state === 'thinking' && 'animate-spin', state === 'listening' && 'animate-pulse')} />{s.label}
      </span>
      <span className="text-slate-500">{LANG_LABEL[lang]} · {bcp47}</span>
      {sttSupported ? <Badge tone={tone}>{label}</Badge> : <Badge tone="amber" title="This browser has no Web Speech recognition. Use Chrome or Edge, or type."><MicOff className="size-3" />Voice input unavailable: type instead</Badge>}
      {!ttsSupported ? <Badge tone="amber"><VolumeX className="size-3" />Spoken replies unavailable</Badge>
        : hasVoice ? <Badge tone={muted ? 'slate' : 'green'}>{muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}{muted ? 'Voice muted' : `${LANG_LABEL[lang]} voice ready`}</Badge>
          : <Badge tone="amber" title="Install a voice for this language in your operating system to hear replies">No {LANG_LABEL[lang]} voice installed: text only</Badge>}
    </div>
  );
}
