import { Button, EmptyState, ExperienceCard, StatusPill } from '../../components/index.js';

export default function OperationalAnalyticsSection({
  campaignByChapter = [],
  campaignTimeline = [],
  campaignQualityByPhase = [],
  funnel = null,
  funnelByChapter = [],
  funnelByPhase = [],
  displayedFunnelTimeline = [],
  displayedChapterTrendGroups = [],
  compactTrendView,
  onToggleTrendView,
  maxRecentGlobalDays,
  maxChapterTrendDays,
  maxChapterTrendGroups
}) {
  return (
    <>
      <div className="grid-two">
        <ExperienceCard title="Progressão por capítulo" variant="mentor">
          {campaignByChapter.length ? (
            <div className="list compact-list">
              {campaignByChapter.map((item) => (
                <div className="list-item" key={item.chapterId}>
                  <div className="row-between">
                    <strong>{item.chapterId}</strong>
                    <StatusPill value={item.completionRate >= 70 ? 'active' : item.completionRate >= 40 ? 'pending' : 'warning'} />
                  </div>
                  <p>desbloqueios: {item.unlocked} · conclusões: {item.completed} · usuários concluíram: {item.completedUsers} · taxa: {Number(item.completionRate || 0).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem progressão de capítulo" description="Os eventos de capítulo aparecerão aqui conforme a campanha for usada." />
          )}
        </ExperienceCard>

        <ExperienceCard title="Linha do tempo de capítulos" variant="result">
          {campaignTimeline.length ? (
            <div className="list compact-list">
              {campaignTimeline.map((item) => (
                <div className="list-item" key={item.day}>
                  <div className="row-between">
                    <strong>{item.day}</strong>
                    <StatusPill value={item.completed > 0 ? 'active' : item.unlocked > 0 ? 'pending' : 'warning'} />
                  </div>
                  <p>desbloqueios: {item.unlocked} · conclusões: {item.completed}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem linha do tempo de capítulos" description="Ainda não há eventos de desbloqueio ou conclusão para o período selecionado." />
          )}
        </ExperienceCard>
      </div>

      <ExperienceCard title="Qualidade por fase da campanha" variant="destaque">
        {campaignQualityByPhase.length ? (
          <div className="list compact-list">
            {campaignQualityByPhase.map((item) => (
              <div className="list-item" key={`${item.chapterId}-${item.phaseId}`}>
                <div className="row-between">
                  <strong>{item.chapterId} · {item.phaseId}</strong>
                  <StatusPill value={item.averageAssessmentScore >= 8 ? 'active' : item.averageAssessmentScore >= 6 ? 'pending' : 'warning'} />
                </div>
                <p>runs: {item.scenarioRuns} · runs concluídos: {item.completedScenarioRuns} · média run: {Number(item.averageScenarioScore || 0).toFixed(2)}</p>
                <p>assessments: {item.assessments} · vinculados: {item.linkedAssessments || 0} · média assessment: {Number(item.averageAssessmentScore || 0).toFixed(2)} · cobertura: {Number(item.assessmentCoverageRate || 0).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem qualidade por fase" description="Os indicadores por fase aparecerão quando houver runs e assessments contextualizados pela campanha." />
        )}
      </ExperienceCard>

      <ExperienceCard title="Leitura temporal" variant="default">
        <div className="row-between">
          <p>{compactTrendView ? 'Visão compacta para leitura executiva.' : 'Visão completa para investigação detalhada.'}</p>
          <Button type="button" variant="secondary" onClick={onToggleTrendView}>
            {compactTrendView ? 'Ver visão completa' : 'Voltar para visão compacta'}
          </Button>
        </div>
      </ExperienceCard>

      <div className="grid-two">
        <ExperienceCard title="Funil da campanha" variant="mentor">
          {funnel ? (
            <div className="list compact-list">
              <div className="list-item">
                <strong>Runs iniciados</strong>
                <p>{funnel.startedRuns || 0}</p>
              </div>
              <div className="list-item">
                <strong>Runs concluídos</strong>
                <p>{funnel.completedRuns || 0} · {Number(funnel.completionRateFromRuns || 0).toFixed(2)}%</p>
              </div>
              <div className="list-item">
                <strong>Assessments enviados</strong>
                <p>{funnel.assessmentsSubmitted || 0} · {Number(funnel.assessmentRateFromCompletedRuns || 0).toFixed(2)}%</p>
              </div>
              <div className="list-item">
                <strong>Assessments vinculados</strong>
                <p>{funnel.linkedAssessments || 0} · {Number(funnel.linkedRateFromAssessments || 0).toFixed(2)}%</p>
              </div>
            </div>
          ) : (
            <EmptyState title="Sem funil disponível" description="O funil aparecerá quando houver runs e assessments suficientes na campanha." />
          )}
        </ExperienceCard>

        <ExperienceCard title="Funil por capítulo" variant="result">
          {funnelByChapter.length ? (
            <div className="list compact-list">
              {funnelByChapter.map((item) => (
                <div className="list-item" key={item.chapterId}>
                  <div className="row-between">
                    <strong>{item.chapterId}</strong>
                    <StatusPill value={item.linkedRateFromAssessments >= 70 ? 'active' : item.linkedRateFromAssessments >= 40 ? 'pending' : 'warning'} />
                  </div>
                  <p>runs iniciados: {item.startedRuns} · concluídos: {item.completedRuns} · conclusão: {Number(item.completionRateFromRuns || 0).toFixed(2)}%</p>
                  <p>assessments: {item.assessmentsSubmitted} · vinculados: {item.linkedAssessments} · vínculo: {Number(item.linkedRateFromAssessments || 0).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem funil por capítulo" description="Os recortes por capítulo aparecerão quando houver volume suficiente na campanha." />
          )}
        </ExperienceCard>
      </div>

      <ExperienceCard title="Funil por fase" variant="destaque">
        {funnelByPhase.length ? (
          <div className="list compact-list">
            {funnelByPhase.map((item) => (
              <div className="list-item" key={item.phaseId}>
                <div className="row-between">
                  <strong>{item.phaseId}</strong>
                  <StatusPill value={item.assessmentRateFromCompletedRuns >= 70 ? 'active' : item.assessmentRateFromCompletedRuns >= 40 ? 'pending' : 'warning'} />
                </div>
                <p>runs iniciados: {item.startedRuns} · concluídos: {item.completedRuns} · conclusão: {Number(item.completionRateFromRuns || 0).toFixed(2)}%</p>
                <p>assessments: {item.assessmentsSubmitted} · vinculados: {item.linkedAssessments} · cobertura pós-run: {Number(item.assessmentRateFromCompletedRuns || 0).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem funil por fase" description="As fases aparecem aqui quando houver runs e assessments correlacionados." />
        )}
      </ExperienceCard>

      <ExperienceCard title="Tendência de vínculo por dia" variant="mentor">
        {displayedFunnelTimeline.length ? (
          <div className="list compact-list">
            <p className="list-item">{compactTrendView ? `Exibindo até ${maxRecentGlobalDays} dias recentes com atividade.` : 'Exibindo todos os dias com atividade no período.'}</p>
            {displayedFunnelTimeline.map((item) => (
              <div className="list-item" key={item.day}>
                <div className="row-between">
                  <strong>{item.day}</strong>
                  <StatusPill value={item.linkedRateFromAssessments >= 70 ? 'active' : item.linkedRateFromAssessments >= 40 ? 'pending' : 'warning'} />
                </div>
                <p>runs iniciados: {item.startedRuns} · concluídos: {item.completedRuns} · assessments: {item.assessmentsSubmitted}</p>
                <p>vinculados: {item.linkedAssessments} · taxa de vínculo: {Number(item.linkedRateFromAssessments || 0).toFixed(2)}% · cobertura pós-run: {Number(item.assessmentRateFromCompletedRuns || 0).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem tendência de vínculo" description="A série temporal aparecerá quando houver atividade diária suficiente na campanha." />
        )}
      </ExperienceCard>

      <ExperienceCard title="Tendência por capítulo" variant="result">
        {displayedChapterTrendGroups.length ? (
          <div className="list compact-list">
            <p className="list-item">{compactTrendView ? `Exibindo até ${maxChapterTrendDays} dias recentes para os ${maxChapterTrendGroups} capítulos com maior atividade.` : 'Exibindo todos os capítulos com atividade e todos os dias disponíveis no período.'}</p>
            {displayedChapterTrendGroups.map((group) => (
              <div className="list-item" key={group.chapterId}>
                <div className="row-between">
                  <strong>{group.chapterId}</strong>
                  <span>{group.totalActivity} interações no período</span>
                </div>
                <div className="list compact-list">
                  {group.entries.map((item) => (
                    <div className="list-item" key={`${item.chapterId}-${item.day}`}>
                      <div className="row-between">
                        <strong>{item.chapterId} · {item.day}</strong>
                        <StatusPill value={item.linkedRateFromAssessments >= 70 ? 'active' : item.linkedRateFromAssessments >= 40 ? 'pending' : 'warning'} />
                      </div>
                      <p>runs iniciados: {item.startedRuns} · concluídos: {item.completedRuns} · assessments: {item.assessmentsSubmitted}</p>
                      <p>vinculados: {item.linkedAssessments} · taxa de vínculo: {Number(item.linkedRateFromAssessments || 0).toFixed(2)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem tendência por capítulo" description="Os capítulos aparecerão aqui quando houver atividade diária contextualizada." />
        )}
      </ExperienceCard>
    </>
  );
}