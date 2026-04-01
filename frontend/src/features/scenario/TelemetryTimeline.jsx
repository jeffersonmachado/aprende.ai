import { TelemetryTimelinePanel } from '../../components';

export default function TelemetryTimeline({ events = [], lastSyncAt }) {
  return <TelemetryTimelinePanel events={events} lastSyncAt={lastSyncAt} />;
}
