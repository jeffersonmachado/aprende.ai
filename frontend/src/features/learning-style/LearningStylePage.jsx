import { useState } from 'react';
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
    <div className="page-stack">
      <h2>Perfil de aprendizagem</h2>
      <p>Seu estilo altera conteúdo, mentoria e formato de simulação.</p>

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

      <div className="list-item">
        <strong>Prévia</strong>
        <p>Conteúdo: {styleConfig[style].contentPreference}</p>
        <p>Mentoria: {styleConfig[style].mentorshipStyle}</p>
        <p>Simulação: {styleConfig[style].simulationFormat}</p>
      </div>

      {error ? <div className="error-box">{error}</div> : null}
      {saved ? <div className="list-item">Perfil salvo com sucesso.</div> : null}
      <button type="button" onClick={handleSave}>Salvar perfil de aprendizagem</button>
    </div>
  );
}
