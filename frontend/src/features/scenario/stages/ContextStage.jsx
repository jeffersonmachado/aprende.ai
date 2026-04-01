import CardContainer from '../CardContainer.jsx';

export default function ContextStage({ scenario, onStart }) {
  const title = scenario?.title || 'Contexto: queda de conversao em canal chave';
  const context = scenario?.context || 'Nas ultimas duas semanas, o time perdeu tracao em um funil critico.';
  const problem = scenario?.problem || 'O comite executivo quer um plano em 24 horas com baixo risco de impacto na receita.';

  return (
    <div className="scenario-stage-stack">
      <CardContainer className="scenario-stage-hero accent-context">
        <span className="scenario-kicker">Missao ativa</span>
        <h2>{title}</h2>
        <p>{context}</p>
        <p>{problem}</p>
        <button onClick={onStart}>Comecar</button>
      </CardContainer>
    </div>
  );
}
