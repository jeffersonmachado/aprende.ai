import { ExperienceCard, StageWrapper } from '../components/index.js';
import JourneyEngine from '../components/journey/JourneyEngine.jsx';
import { useJourneyRuntime } from '../context/JourneyRuntimeContext.jsx';

export default function JourneyMapPage() {
  const { runtime, loading, error } = useJourneyRuntime();
  const chapters = runtime?.campaign?.chapters || [];

  return (
    <StageWrapper
      stageKey="journey-map"
      title="Mapa da jornada"
      subtitle="Visão viva da trilha, capítulos, fases, bosses e progresso atual." 
      completed={Number(runtime?.journey?.progressPercent || 0)}
      total={100}
      variant="mentor"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      {runtime?.journey?.state ? (
        <JourneyEngine
          journeyState={runtime.journey.state}
          selectedStepId={runtime.journey.activeStepId}
          onStepComplete={() => Promise.resolve()}
        />
      ) : null}
      <ExperienceCard title="Capítulos e fases" variant="default">
        <div className="list compact-list">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="list-item">
              <strong>{chapter.title}</strong>
              <p>{(chapter.phases || []).map((phase) => phase.title).join(' · ')}</p>
            </div>
          ))}
        </div>
      </ExperienceCard>
    </StageWrapper>
  );
}