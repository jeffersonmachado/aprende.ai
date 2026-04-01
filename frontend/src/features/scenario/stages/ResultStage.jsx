import CardContainer from '../CardContainer.jsx';

const kpiCards = [
  { label: 'Conversao projetada', value: '+11%', detail: 'Recuperacao esperada nas proximas 2 semanas.' },
  { label: 'Risco operacional', value: '-23%', detail: 'Exposicao reduzida com controles adicionais.' },
  { label: 'Tempo de recuperacao', value: '6 dias', detail: 'Estimativa para estabilizar o indicador principal.' }
];

function buildKpiCards(result, selectedOption) {
  if (!result) {
    return kpiCards;
  }

  return [
    {
      label: 'Impacto de score',
      value: `${Number(result.scoreDelta || 0) >= 0 ? '+' : ''}${Number(result.scoreDelta || 0).toFixed(1)}`,
      detail: 'Delta oficial registrado no backend da simulacao.'
    },
    {
      label: 'Decisao aplicada',
      value: selectedOption?.label || selectedOption?.title || 'Opcao selecionada',
      detail: 'Opcao usada pelo motor para calcular consequencias.'
    },
    {
      label: 'Feedback sintetico',
      value: 'IA',
      detail: result.feedback || 'Feedback indisponivel para este ciclo.'
    }
  ];
}

export default function ResultStage({ decisionResult, selectedOption, onComplete }) {
  const cards = buildKpiCards(decisionResult, selectedOption);

  return (
    <div className="scenario-stage-stack">
      <h2>Resultado da decisao</h2>
      <div className="scenario-cards-grid">
        {cards.map((kpi) => (
          <CardContainer key={kpi.label} className="accent-result">
            <span className="scenario-kicker">KPI atualizado</span>
            <h3>{kpi.label}</h3>
            <strong className="scenario-big-number">{kpi.value}</strong>
            <p>{kpi.detail}</p>
          </CardContainer>
        ))}
      </div>
      <button onClick={onComplete}>Avancar para evolucao</button>
    </div>
  );
}
