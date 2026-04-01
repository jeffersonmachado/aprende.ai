import CardContainer from '../CardContainer.jsx';

const analysisCards = [
  { title: 'Conversao', value: '-18%', detail: 'Queda acumulada no canal premium em 14 dias.' },
  { title: 'Tempo medio de resposta', value: '+34%', detail: 'Fila de atendimento acima do nivel esperado.' },
  { title: 'Satisfacao do cliente', value: '71/100', detail: 'Indice caiu 9 pontos apos mudanca de processo.' }
];

function buildAnalysisCards(scenario) {
  if (!scenario) return analysisCards;

  const consequences = scenario.consequencesJson || {};
  const competencies = Array.isArray(scenario.competenciesEvaluatedJson)
    ? scenario.competenciesEvaluatedJson
    : [];

  return [
    {
      title: 'Dificuldade',
      value: String(scenario.difficulty || 'medium').toUpperCase(),
      detail: 'Nivel oficial definido pelo motor adaptativo.'
    },
    {
      title: 'Melhor cenario',
      value: 'Best case',
      detail: consequences.bestCase || 'Nao informado.'
    },
    {
      title: 'Competencias foco',
      value: String(competencies.length || 0),
      detail: competencies.length ? competencies.join(', ') : 'Sem competencias mapeadas.'
    }
  ];
}

export default function AnalysisStage({ scenario, onComplete }) {
  const cards = buildAnalysisCards(scenario);

  return (
    <div className="scenario-stage-stack">
      <h2>Analise de sinais</h2>
      <div className="scenario-cards-grid">
        {cards.map((item) => (
          <CardContainer key={item.title} className="accent-analysis">
            <span className="scenario-kicker">Metrica</span>
            <h3>{item.title}</h3>
            <strong className="scenario-big-number">{item.value}</strong>
            <p>{item.detail}</p>
          </CardContainer>
        ))}
      </div>
      <button onClick={onComplete}>Concluir analise</button>
    </div>
  );
}
