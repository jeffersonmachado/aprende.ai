import CardContainer from '../CardContainer.jsx';

const evolutionCards = [
  { title: 'Competencias avaliadas', text: 'Priorizacao, leitura de risco e comunicacao executiva.' },
  { title: 'Feedback da IA', text: 'Boa resposta sob pressao. Fortaleca criterio de corte para reduzir retrabalho.' },
  { title: 'Ponto forte', text: 'Conseguiu equilibrar velocidade com monitoramento de impacto.' },
  { title: 'Melhoria sugerida', text: 'Evidenciar trade-offs com metrica de sucesso antes de executar.' }
];

function buildEvolutionCards(evolution) {
  if (!evolution) {
    return evolutionCards;
  }

  const competency = evolution.competencies?.[0];
  const recommendation = evolution.progression?.nextRecommendation;

  return [
    {
      title: 'Competencia em destaque',
      text: competency
        ? `${competency.competencyId || 'Competencia'} com score ${Number(competency.score || 0).toFixed(1)}.`
        : 'Ainda sem competencia consolidada para exibir.'
    },
    {
      title: 'Dificuldade adaptativa',
      text: `Nivel atual: ${evolution.progression?.adaptiveDifficulty || 'medium'}.`
    },
    {
      title: 'Proxima recomendacao',
      text: recommendation
        ? `${recommendation.focus || 'tomada de decisao'} em dificuldade ${recommendation.difficulty || 'medium'}.`
        : 'Nenhuma recomendacao disponivel no momento.'
    },
    {
      title: 'Progresso geral',
      text: `${Number(evolution.progression?.progressPercent || 0).toFixed(0)}% da progressao registrada.`
    }
  ];
}

export default function EvolutionStage({ evolution, onNextMission }) {
  const cards = buildEvolutionCards(evolution);

  return (
    <div className="scenario-stage-stack">
      <h2>Evolucao de competencias</h2>
      <div className="scenario-cards-grid">
        {cards.map((item) => (
          <CardContainer key={item.title} className="accent-evolution">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </CardContainer>
        ))}
      </div>
      <button onClick={onNextMission}>Proxima missao</button>
    </div>
  );
}
