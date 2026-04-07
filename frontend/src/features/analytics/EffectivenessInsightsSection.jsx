import { EmptyState, ExperienceCard, StatusPill } from '../../components/index.js';

export default function EffectivenessInsightsSection({ byKind = [], byStyle = [], topUsers = [], timeSeries = [], heatmapKindStyle = [] }) {
  return (
    <>
      <div className="grid-two">
        <ExperienceCard title="Efetividade por kind" variant="result">
          {byKind.length ? (
            <div className="list compact-list">
              {byKind.map((item) => (
                <div className="list-item" key={item.kind}>
                  <div className="row-between">
                    <strong>{item.kind}</strong>
                    <StatusPill value={item.resolutionRate >= 70 ? 'active' : item.resolutionRate >= 40 ? 'pending' : 'warning'} />
                  </div>
                  <p>triggered: {item.triggered} · resolved: {item.resolved} · taxa: {Number(item.resolutionRate || 0).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem dados por kind" description="Ajuste filtros ou aguarde novos eventos de twist." />
          )}
        </ExperienceCard>

        <ExperienceCard title="Benchmark por estilo" variant="default">
          {byStyle.length ? (
            <div className="list compact-list">
              {byStyle.map((item) => (
                <div className="list-item" key={item.dominantStyle}>
                  <div className="row-between">
                    <strong>{item.dominantStyle}</strong>
                    <StatusPill value={item.resolutionRate >= 70 ? 'active' : item.resolutionRate >= 40 ? 'pending' : 'warning'} />
                  </div>
                  <p>users: {item.users} · triggered: {item.triggered} · taxa: {Number(item.resolutionRate || 0).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem benchmark por estilo" description="Ainda nao ha volume suficiente para comparacao." />
          )}
        </ExperienceCard>
      </div>

      <ExperienceCard title="Top usuários por resolução" variant="destaque">
        {topUsers.length ? (
          <div className="list compact-list">
            {topUsers.map((item) => (
              <div className="list-item" key={item.userId}>
                <div className="row-between">
                  <strong>{item.userId}</strong>
                  <StatusPill value={item.resolutionRate >= 70 ? 'active' : item.resolutionRate >= 40 ? 'pending' : 'warning'} />
                </div>
                <p>estilo: {item.dominantStyle || 'n/d'} · triggered: {item.triggered} · taxa: {Number(item.resolutionRate || 0).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem ranking disponível" description="Nao foram encontrados usuarios para os filtros atuais." />
        )}
      </ExperienceCard>

      <div className="grid-two">
        <ExperienceCard title="Série temporal (resolução por dia)" variant="mentor">
          {timeSeries.length ? (
            <div className="list compact-list">
              {timeSeries.map((item) => (
                <div className="list-item" key={item.day}>
                  <div className="row-between">
                    <strong>{item.day}</strong>
                    <StatusPill value={item.resolutionRate >= 70 ? 'active' : item.resolutionRate >= 40 ? 'pending' : 'warning'} />
                  </div>
                  <p>triggered: {item.triggered} · resolved: {item.resolved} · taxa: {Number(item.resolutionRate || 0).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem série temporal" description="Ainda não há eventos no período selecionado." />
          )}
        </ExperienceCard>

        <ExperienceCard title="Heatmap kind x estilo" variant="result">
          {heatmapKindStyle.length ? (
            <div className="list compact-list">
              {heatmapKindStyle.map((item) => (
                <div className="list-item" key={`${item.kind}-${item.dominantStyle}`}>
                  <div className="row-between">
                    <strong>{item.kind} × {item.dominantStyle}</strong>
                    <StatusPill value={item.resolutionRate >= 70 ? 'active' : item.resolutionRate >= 40 ? 'pending' : 'warning'} />
                  </div>
                  <p>triggered: {item.triggered} · resolved: {item.resolved} · taxa: {Number(item.resolutionRate || 0).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem heatmap" description="Não há combinações kind x estilo para os filtros aplicados." />
          )}
        </ExperienceCard>
      </div>
    </>
  );
}