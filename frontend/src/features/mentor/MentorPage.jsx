import { useState } from 'react';
import { MentorCard } from '../../components/DomainComponents.jsx';
import { Badge, Button, Dialog, ExperienceCard, StageWrapper } from '../../components';
import { sendMentorMessage } from '../../services/mentorApi.js';

const QUICK_PROMPTS = [
  'Como reduzir risco sem perder velocidade nesta fase?',
  'Que trade-off estou ignorando ao priorizar este backlog critico?',
  'Como transformar minha decisao em um plano executavel para o time?',
];

function getAchievementKey(item, index) {
  if (!item || typeof item !== 'object') return `mentor-achievement-${index}`;
  return item.id || item.code || item.achievementId || `mentor-achievement-${index}`;
}

function getAchievementLabel(item) {
  if (!item || typeof item !== 'object') return 'Conquista liberada';
  return item.title || item.name || item.label || item.code || 'Conquista liberada';
}

export default function MentorPage({ campaignMode = false, onAdvance = null, advanceLabel = 'Seguir para a proxima fase', campaignPhase = null }) {
  const [message, setMessage] = useState('');
  const [mentorMode, setMentorMode] = useState('coach_encorajador');
  const [mentorResponse, setMentorResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const mentorContent = campaignPhase?.content || null;
  const quickPrompts = mentorContent?.quickPrompts?.length ? mentorContent.quickPrompts : QUICK_PROMPTS;
  const contextualScene = mentorContent?.sceneLabel || 'Priorizacao critica de sprint';
  const recentDecisionLabel = mentorContent?.recentDecisionLabel || 'Alinhar risco antes da execucao';
  const focusCompetency = mentorContent?.focusCompetency || 'Assertividade com consistencia';

  async function handleSend(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await sendMentorMessage(message, mentorMode, mentorContent?.apiContext || null);
      setMentorResponse(data);
      if (data?.gamification?.leveledUp || (data?.gamification?.unlockedAchievements || []).length) {
        setShowCelebration(true);
      }
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <StageWrapper
        stageKey="mentor"
        title={campaignPhase?.content?.title || 'Mentor IA'}
        subtitle={campaignPhase?.content?.description || 'Mentoria adaptada ao seu perfil, meta e jornada atual.'}
        completed={mentorResponse ? 1 : 0}
        total={1}
        variant="mentor"
      >
        <ExperienceCard variant="mentor" title="Estado da mentoria" className="mentor-hero mentor-story-hero">
          <p className="mentor-hero-text">{mentorContent?.heroText || 'O mentor atua como diretor de leitura: interpreta tensão, devolve critério e empurra a próxima ação com consequência explícita.'}</p>
          <div className="inline-pills">
            <Badge variant="xp">+{mentorResponse?.gamification?.xpAwarded || 0} XP</Badge>
            <Badge variant="level">Nivel {mentorResponse?.gamification?.level || 1}</Badge>
            <Badge variant="streak">Streak {mentorResponse?.gamification?.streak || 0}d</Badge>
          </div>
          <div className="mentor-story-grid">
            <div className="mentor-state-panel">
              <span>Postura ativa</span>
              <strong>{mentorResponse?.coach?.mentorMode || 'Coach encorajador'}</strong>
              <p>Tom configurado para devolver leitura acionável da decisão atual.</p>
            </div>
            <div className="mentor-state-panel">
              <span>Foco da rodada</span>
              <strong>{mentorResponse?.coach?.relatedCompetency || 'Assertividade com consistencia'}</strong>
              <p>{mentorResponse?.coach?.performanceFeedback || 'O mentor ainda está preparando leitura da situação.'}</p>
            </div>
            <div className="mentor-state-panel">
              <span>Próximo movimento</span>
              <strong>{mentorResponse?.coach?.nextAction || 'Definir próximo passo com critério claro'}</strong>
              <p>{mentorResponse?.coach?.reflectionPrompt || 'Qual sinal precisa mudar para provar que a decisão funcionou?'}</p>
            </div>
          </div>
        </ExperienceCard>

        <div className="grid gap-4 md:grid-cols-2 mentor-context-grid">
          <ExperienceCard title="Cena atual" variant="default"><MentorCard title="Cena atual" value={contextualScene} /></ExperienceCard>
          <ExperienceCard title="Decisao mais recente" variant="default"><MentorCard title="Decisao mais recente" value={recentDecisionLabel} /></ExperienceCard>
          <ExperienceCard title="Competencia sob observacao" variant="default"><MentorCard title="Competencia sob observacao" value={focusCompetency} /></ExperienceCard>
          <ExperienceCard title="Tom do mentor" variant="default"><MentorCard title="Tom do mentor" value={mentorResponse?.coach?.mentorMode || 'Coach encorajador'} /></ExperienceCard>
        </div>

        <ExperienceCard className="mt-4" title="Converse com o mentor" variant="mentor" active loading={loading}>
          <form className="space-y-3" onSubmit={handleSend}>
            <label className="block text-sm font-medium text-muted-700 dark:text-muted-300">
              Modo do coach
              <select
                value={mentorMode}
                onChange={(e) => setMentorMode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
              >
                <option value="coach_encorajador">Coach encorajador</option>
                <option value="socratico">Socrático</option>
                <option value="analitico">Analítico</option>
                <option value="direto_acao">Direto à ação</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-muted-700 dark:text-muted-300">
              Sua mensagem
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={mentorContent?.messagePlaceholder || 'Quero ajuda para descrever a decisao, a pressao do contexto e o ponto em que quero ganhar criterio.'}
                className="mt-1 min-h-28 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
              />
            </label>
            <div className="mentor-quick-prompts">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="secondary-button mentor-quick-prompt-btn"
                  onClick={() => setMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            {error ? <div className="error-box">{error}</div> : null}
            <Button type="submit" disabled={loading || !message.trim()}>{loading ? 'Transmitindo...' : 'Enviar ao mentor'}</Button>
          </form>
        </ExperienceCard>

        {mentorResponse?.coach ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2 mentor-response-grid">
            <ExperienceCard title="Leitura da situação" variant="result" active className="mentor-response-callout">
              <p>{mentorResponse.coach.situationalRead}</p>
              <p className="text-sm text-muted-600 dark:text-muted-300">{mentorResponse.coach.performanceFeedback}</p>
            </ExperienceCard>

            <ExperienceCard title="Plano de ação" variant="decision">
              <p><strong>Próxima ação:</strong> {mentorResponse.coach.nextAction}</p>
              <p><strong>Reflexão:</strong> {mentorResponse.coach.reflectionPrompt}</p>
              <p><strong>Competência associada:</strong> {mentorResponse.coach.relatedCompetency}</p>
            </ExperienceCard>

            {mentorResponse?.proactiveCheckIn?.shouldPrompt ? (
              <ExperienceCard title="Check-in proativo" variant="warning">
                <p>{mentorResponse.proactiveCheckIn.message}</p>
                <p className="mt-2 text-sm text-muted-700 dark:text-muted-300">
                  <strong>Ação sugerida:</strong> {mentorResponse.proactiveCheckIn.suggestedAction}
                </p>
              </ExperienceCard>
            ) : null}

            <ExperienceCard title="Próximo passo recomendado" variant="mentor">
              <p className="text-sm text-muted-700 dark:text-muted-300">Executar nas próximas 24h com critério explícito</p>
              <p className="mt-2 text-base font-semibold text-primary-700 dark:text-primary-300">{mentorResponse.coach.nextAction}</p>
            </ExperienceCard>

            <ExperienceCard title="Reforço do coach" variant="success" className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <Badge variant="xp">+{mentorResponse?.gamification?.xpAwarded || 0} XP</Badge>
                <Badge variant="level">Nível {mentorResponse?.gamification?.level || 1}</Badge>
                <Badge variant="streak">Streak {mentorResponse?.gamification?.streak || 0}d</Badge>
              </div>
              <p>{mentorResponse.coach.positiveReinforcement}</p>
              {(mentorResponse?.gamification?.unlockedAchievements || []).length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentorResponse.gamification.unlockedAchievements.map((achievement, index) => (
                    <Badge key={getAchievementKey(achievement, index)} variant="achieved">Conquista: {getAchievementLabel(achievement)}</Badge>
                  ))}
                </div>
              ) : null}
            </ExperienceCard>

            {campaignMode && onAdvance ? (
              <ExperienceCard title="Continuidade da campanha" variant="mentor" className="lg:col-span-2 campaign-phase-next-card">
                <p>Leitura recebida. O próximo quadro agora transforma essa orientação em evidência objetiva.</p>
                <Button type="button" onClick={onAdvance}>{advanceLabel}</Button>
              </ExperienceCard>
            ) : null}
          </div>
        ) : null}

        <Dialog
          open={showCelebration}
          onOpenChange={setShowCelebration}
          title="Evolução registrada"
          description="Seu progresso foi salvo e contabilizado na jornada."
          actions={[
            <Button key="close" variant="primary" onClick={() => setShowCelebration(false)}>
              Continuar jornada
            </Button>
          ]}
        >
          <div className="space-y-2">
            <p>XP ganho nesta interação: <strong>{mentorResponse?.gamification?.xpAwarded || 0}</strong></p>
            <p>Nível atual: <strong>{mentorResponse?.gamification?.level || 1}</strong></p>
            <p>Streak atual: <strong>{mentorResponse?.gamification?.streak || 0} dias</strong></p>
          </div>
        </Dialog>
      </StageWrapper>
    </div>
  );
}
