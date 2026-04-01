import React from 'react';
import { ExperienceCard } from '../index';

function formatEventType(type) {
  return String(type || 'evento')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime(value) {
  if (!value) return '--:--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--:--';
  return date.toLocaleTimeString('pt-BR');
}

function summarizePayload(payload) {
  if (!payload || typeof payload !== 'object') return '';

  const keys = Object.keys(payload).slice(0, 3);
  if (!keys.length) return '';

  return keys
    .map((key) => `${key}: ${String(payload[key])}`)
    .join(' | ');
}

const TelemetryTimelinePanel = ({ events = [], lastSyncAt }) => {
  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  return (
    <ExperienceCard
      kicker="Observabilidade"
      title="Auditoria da jornada"
      subtitle={`Ultima sincronizacao: ${formatTime(lastSyncAt)}`}
    >
      {!sortedEvents.length ? (
        <p className="text-sm text-muted-500 dark:text-muted-400">Sem eventos registrados ainda.</p>
      ) : (
        <ul className="space-y-2">
          {sortedEvents.map((event) => (
            <li key={event.id} className="rounded-xl border border-muted-200 bg-white/70 px-3 py-2 dark:border-dark-700 dark:bg-dark-800/70">
              <div className="mb-1 flex items-center justify-between gap-3">
                <strong className="text-sm text-muted-900 dark:text-muted-50">{formatEventType(event.type)}</strong>
                <small className="text-xs text-muted-500 dark:text-muted-400">{formatTime(event.createdAt)}</small>
              </div>
              <small className="block text-xs text-muted-600 dark:text-muted-400">Etapa: {event.stepId || 'n/a'}</small>
              {summarizePayload(event.payload) ? (
                <small className="mt-1 block text-xs text-muted-600 dark:text-muted-400">{summarizePayload(event.payload)}</small>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </ExperienceCard>
  );
};

export default TelemetryTimelinePanel;
