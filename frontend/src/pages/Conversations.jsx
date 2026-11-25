import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Workflow, MessagesSquare } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Button, Card, DemoTag, EmptyState, ErrorState, PageHeader, STATUS_TONE, cx } from '../components/ui';
import ChatTranscript from '../components/agent/ChatTranscript';
import SummaryCard from '../components/SummaryCard';
import { fmtDateTime, LANG_LABEL } from '../lib/format';

function Detail({ id, onChanged }) {
  const state = useApi(`/conversations/${id}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const remove = async () => {
    if (
      !window.confirm(
        'Permanently delete this conversation, its messages, summary and decision traces? This cannot be undone.',
      )
    )
      return;
    try {
      await api(`/conversations/${id}`, { method: 'DELETE' });
      onChanged();
      navigate('/conversations');
    } catch (err) {
      setError(err);
    }
  };

  const summarise = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/conversations/${id}/end`, { method: 'POST' });
      state.reload();
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Async state={state}>
      {(c) => (
        <div className="space-y-6">
          <Card
            title={c.lead?.full_name || 'Unnamed caller'}
            subtitle={`${LANG_LABEL[c.language]} · ${c.channel} · started ${fmtDateTime(c.started_at)}`}
            padded={false}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                <Link
                  to={`/traces?conversationId=${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-brand hover:bg-brand-soft/50"
                >
                  <Workflow className="size-4" />
                  Decision traces
                </Link>
                {user?.role === 'admin' && (
                  <Button size="sm" variant="danger" onClick={remove}>
                    Delete
                  </Button>
                )}
              </div>
            }
          >
            {c.escalation_reason && (
              <div className="border-b border-danger-border bg-danger-soft px-6 py-3 text-[13px] font-medium text-danger">
                Escalated: {c.escalation_reason}
              </div>
            )}
            <div className="flex max-h-[580px] flex-col">
              <ChatTranscript
                messages={c.messages.map((m) => ({
                  ...m,
                  sentiment: m.sentiment
                    ? { label: m.sentiment, confidence: m.sentiment_confidence, evidence: m.sentiment_evidence }
                    : null,
                }))}
              />
            </div>
          </Card>

          <Card
            title="Call summary"
            action={
              <Button size="sm" variant="secondary" loading={busy} onClick={summarise}>
                {c.summary ? 'Regenerate' : c.status === 'active' ? 'End & summarise' : 'Generate summary'}
              </Button>
            }
          >
            {error && <ErrorState error={error} />}
            {c.summary ? (
              <SummaryCard summary={c.summary.summary} />
            ) : (
              <p className="text-sm text-ink-muted">
                No summary yet. Summaries are generated automatically when a call ends.
              </p>
            )}
          </Card>
        </div>
      )}
    </Async>
  );
}

export default function Conversations() {
  const { id } = useParams();
  const list = useApi('/conversations');

  return (
    <div>
      <PageHeader
        eyebrow="Interaction Archive"
        title="Conversations"
        description="Complete voice and text customer transcripts persisted with per-message sentiment analysis, evidence phrases, and RAG citations."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card title="Conversation threads" padded={false} className="overflow-hidden">
          <Async state={list}>
            {(rows) =>
              !rows.length ? (
                <div className="p-6">
                  <EmptyState icon={MessagesSquare} title="No conversations yet" />
                </div>
              ) : (
                <ul className="scrollbar-thin max-h-[calc(100vh-240px)] divide-y divide-line overflow-y-auto">
                  {rows.map((c) => {
                    const active = id === c.id;
                    return (
                      <li key={c.id}>
                        <Link
                          to={`/conversations/${c.id}`}
                          className={cx(
                            'block border-l-2 px-5 py-4 transition-colors hover:bg-canvas',
                            active ? 'border-l-brand bg-brand-soft/30' : 'border-l-transparent',
                          )}
                        >
                          <div className="flex items-center gap-2 text-[15px] font-medium text-ink">
                            <span className="truncate">{c.full_name || 'Unnamed caller'}</span>
                            {c.is_demo && <DemoTag />}
                            <Badge tone={STATUS_TONE[c.status]} className="ml-auto">
                              {c.status}
                            </Badge>
                          </div>
                          <div className="mt-1 truncate text-[13px] text-ink-2">
                            {c.first_message || 'No customer message'}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-xs text-ink-muted">
                            <span>{fmtDateTime(c.started_at)}</span>
                            <span>·</span>
                            <span>{c.message_count} msgs</span>
                            <span>·</span>
                            <span>{LANG_LABEL[c.language]}</span>
                            {c.score != null && <span>· score {c.score}</span>}
                            {c.has_summary && <span>· summary</span>}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )
            }
          </Async>
        </Card>

        <div className="min-w-0">
          {id ? (
            <Detail key={id} id={id} onChanged={list.reload} />
          ) : (
            <Card>
              <EmptyState
                icon={MessagesSquare}
                title="Select a conversation"
                hint="Choose a thread from the inbox on the left to review the full transcript, sentiment evidence, and call summary."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
