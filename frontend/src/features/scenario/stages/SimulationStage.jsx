import CardContainer from '../CardContainer.jsx';

export default function SimulationStage({ simulationStatus, onRun, onComplete }) {
  const isRunning = simulationStatus === 'running';

  return (
    <div className="scenario-stage-stack">
      <h2>Simulacao dinamica</h2>
      <CardContainer className="scenario-simulation-shell accent-simulation">
        <p>
          Motor de simulacao avaliando consequencias de curto e medio prazo com base na decisao registrada.
        </p>
        <div className={`scenario-loader ${isRunning ? 'is-running' : ''}`}>
          <span />
          <span />
          <span />
        </div>
        <p className="scenario-stage-subtitle">
          {isRunning
            ? 'Plot twist: um concorrente lancou oferta agressiva durante a execucao.'
            : 'Pronto para iniciar a simulacao.'}
        </p>
      </CardContainer>

      <div className="row-between wrap gap-sm">
        <button onClick={onRun} disabled={isRunning}>{isRunning ? 'Simulando...' : 'Rodar simulacao'}</button>
        <button className="secondary-button" onClick={onComplete}>Continuar apos simulacao</button>
      </div>
    </div>
  );
}
