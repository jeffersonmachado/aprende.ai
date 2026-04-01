import { useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components';
import { saveLearningStyle } from '../../services/profileApi.js';

const styleConfig = {
  explorador: {
    contentPreference: 'exploracao guiada',
    mentorshipStyle: 'socratico',
    simulationFormat: 'aberto'
  },
  pratico: {
    contentPreference: 'hands-on',
    mentorshipStyle: 'direto',
    simulationFormat: 'decisao rapida'
  },
  narrativo: {
    contentPreference: 'storytelling',
    mentorshipStyle: 'reflexivo',
    simulationFormat: 'ramificado'
  },
  analitico: {
    contentPreference: 'dados e modelos',
    mentorshipStyle: 'analitico',
    simulationFormat: 'orientado a metricas'
  }
};

export default function LearningStylePage() {
  const [style, setStyle] = useState('pratico');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaved(false);
    setError('');
    try {
      await saveLearningStyle({
        dominantStyle: style,
        ...styleConfig[style]
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <StageWrapper
      stageKey="learning-style"
      title="Perfil de aprendizagem"
      subtitle="Seu estilo altera conteúdo, mentoria e formato de simulação"
      completed={saved ? 1 : 0}
      total={1}
      variant="mentor"
      loading={false}
    >
      <ExperienceCard variant="mentor" title="Selecione o estilo dominante">
        <div className="list">
          {Object.keys(styleConfig).map((key) => {
            const selected = key === style;
            return (
              <button key={key} className="secondary-button" onClick={() => setStyle(key)} type="button">
                {selected ? '● ' : ''}{key}
              </button>
            );
          })}
        </div>
      </ExperienceCard>

      <ExperienceCard variant="default" title="Prévia" className="mt-4">
        <div className="list-item">
          <strong>Prévia</strong>
          <p>Conteúdo: {styleConfig[style].contentPreference}</p>
          <p>Mentoria: {styleConfig[style].mentorshipStyle}</p>
          <p>Simulação: {styleConfig[style].simulationFormat}</p>
        </div>
      </ExperienceCard>

      {error ? <div className="error-box">{error}</div> : null}
      {saved ? <div className="list-item">Perfil salvo com sucesso.</div> : null}
      <Button type="button" onClick={handleSave}>Salvar perfil de aprendizagem</Button>
    </StageWrapper>
  );
}
