import { Mic, MicOff, Volume2, VolumeX, Loader2, Radio } from 'lucide-react';
import { Badge, cx } from '../ui';
import { LANG_LABEL } from '../../lib/format';

const STATES = {
  idle: {
    label: 'Ready',
    cls: 'border-line bg-surface-2 text-ink-2',
    darkCls: 'border-rail-border bg-rail-2 text-rail-ink',
    icon: Radio,
    wave: false,
  },
  listening: {
    label: 'Listening…',
    cls: 'border-danger-border bg-danger-soft text-danger',
    darkCls: 'border-danger-border bg-danger-soft text-danger',
    icon: Mic,
    wave: true,
    barColor: 'bg-danger',
  },
  thinking: {
    label: 'Processing…',
    cls: 'border-warning-border bg-warning-soft text-warning',
    darkCls: 'border-warning-border bg-warning-soft text-warning',
    icon: Loader2,
    wave: false,
  },
  speaking: {
    label: 'Speaking…',
    cls: 'border-success-border bg-success-soft text-success',
    darkCls: 'border-success-border bg-success-soft text-success',
    icon: Volume2,
    wave: true,
    barColor: 'bg-success',
  },
};

const PERMISSION = {
  granted: ['green', 'Mic allowed'],
  denied: ['red', 'Mic blocked'],
  prompt: ['amber', 'Mic: will ask'],
  unknown: ['slate', 'Mic permission unknown'],
};

/** One line that answers: what is the agent doing now, and what can this browser do for this language? */
export default function VoiceStatus({
  state,
  lang,
  bcp47,
  sttSupported,
  permission,
  ttsSupported,
  hasVoice,
  muted,
  onDark = false,
}) {
  const s = STATES[state];
  const Icon = s.icon;
  const [tone, label] = PERMISSION[permission];

  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <span
        role="status"
        aria-live="polite"
        className={cx(
          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
          onDark ? s.darkCls : s.cls,
        )}
      >
        <Icon className={cx('size-3.5', state === 'thinking' && 'animate-spin')} />
        <span>{s.label}</span>
        {s.wave && (
          <span className="ml-0.5 flex h-3 items-center gap-0.5" aria-hidden="true">
            <span className={cx('vq-wave-bar h-3 w-0.5 rounded-full', s.barColor)} style={{ animationDelay: '0ms' }} />
            <span className={cx('vq-wave-bar h-3 w-0.5 rounded-full', s.barColor)} style={{ animationDelay: '180ms' }} />
            <span className={cx('vq-wave-bar h-3 w-0.5 rounded-full', s.barColor)} style={{ animationDelay: '360ms' }} />
          </span>
        )}
      </span>

      <span className={cx('font-mono text-xs', onDark ? 'text-rail-muted' : 'text-ink-muted')}>
        {LANG_LABEL[lang]} · {bcp47}
      </span>

      {sttSupported ? (
        <Badge tone={tone}>{label}</Badge>
      ) : (
        <Badge
          tone="amber"
          title="This browser has no Web Speech recognition. Use Chrome or Edge, or type."
        >
          <MicOff className="size-3.5" />
          Voice input unavailable: type instead
        </Badge>
      )}

      {!ttsSupported ? (
        <Badge tone="amber">
          <VolumeX className="size-3.5" />
          Spoken replies unavailable
        </Badge>
      ) : hasVoice ? (
        <Badge tone={muted ? 'slate' : 'green'}>
          {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          {muted ? 'Voice muted' : `${LANG_LABEL[lang]} voice ready`}
        </Badge>
      ) : (
        <Badge
          tone="amber"
          title="Install a voice for this language in your operating system to hear replies"
        >
          No {LANG_LABEL[lang]} voice installed: text only
        </Badge>
      )}
    </div>
  );
}
