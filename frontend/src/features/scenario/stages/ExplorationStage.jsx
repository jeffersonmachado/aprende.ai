import CardContainer from '../CardContainer.jsx';

const explorationPrompts = [
  {
    title: 'Hipotese 1',
    text: 'A principal causa e operacional (gargalo interno) ou de proposta de valor?'
  },
  {
    title: 'Hipotese 2',
    text: 'Quais segmentos foram mais afetados e por qual sequencia de eventos?'
  },
  {
    title: 'Hipotese 3',
    text: 'Qual decisao pode gerar ganho rapido sem comprometer sustentabilidade?'
  }
];

function buildPrompts(scenario, options) {
  if (!scenario) return explorationPrompts;

  const dynamicPrompts = [
    {
      title: 'Leitura de contexto',
      text: scenario.context || 'Qual contexto principal deve guiar a decisao?'
    },
    {
      title: 'Risco principal',
      text: scenario.problem || 'Qual risco nao pode ser negligenciado neste ciclo?'
    }
  ];

  if (Array.isArray(options) && options.length) {
    dynamicPrompts.push({
      title: 'Alternativas disponiveis',
      text: options.map((item) => item.label).join(' | ')
    });
  }

  return dynamicPrompts;
}

export default function ExplorationStage({ scenario, options, onComplete }) {
  const prompts = buildPrompts(scenario, options);

  return (
    <div className="scenario-stage-stack">
      <h2>Exploracao guiada</h2>
      <p className="scenario-stage-subtitle">Mentor IA: antes da decisao final, valide cenarios alternativos.</p>
      <div className="scenario-cards-grid">
        {prompts.map((prompt) => (
          <CardContainer key={prompt.title} className="accent-exploration">
            <span className="scenario-kicker">Pergunta orientadora</span>
            <h3>{prompt.title}</h3>
            <p>{prompt.text}</p>
          </CardContainer>
        ))}
      </div>
      <button onClick={onComplete}>Finalizar exploracao</button>
    </div>
  );
}
