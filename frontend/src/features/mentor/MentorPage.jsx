import { useState } from 'react';
import { MentorCard } from '../../components/DomainComponents.jsx';
import { Badge, Button, Dialog, ExperienceCard, StageWrapper } from '../../components';
import { sendMentorMessage } from '../../services/mentorApi.js';

const QUICK_PROMPTS = [
  'Como reduzir risco sem atrasar a entrega?',
  'Qual criterio usar para priorizar backlog critico?',
  'Como melhorar assertividade da minha decisao?',
];

export default function MentorPage() {
  const [message, setMessage] = useState('');
  const [mentorMode, setMentorMode] = useState('coach_encorajador');
  const [mentorResponse, setMentorResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  async function handleSend(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await sendMentorMessage(message, mentorMode);
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
        title="Mentor IA"
        subtitle="Mentoria adaptada ao seu perfil, meta e jornada atual."
        completed={mentorResponse ? 1 : 0}
        total={1}
        variant="mentor"
      >
        <ExperienceCard variant="mentor" title="Estado da mentoria" className="mentor-hero">
          <p className="mentor-hero-text">Mentoria contextual com reforco de progresso por interacao.</p>
          <div className="inline-pills">
            <Badge variant="xp">+{mentorResponse?.gamification?.xpAwarded || 0} XP</Badge>
            <Badge variant="level">Nivel {mentorResponse?.gamification?.level || 1}</Badge>
            <Badge variant="streak">Streak {mentorResponse?.gamification?.streak || 0}d</Badge>
          </div>
        </ExperienceCard>

        <div className="grid gap-4 md:grid-cols-2">
          <ExperienceCard title="Cenario atual" variant="default"><MentorCard title="Cenario atual" value="Priorizacao critica de sprint" /></ExperienceCard>
          <ExperienceCard title="Decisao anterior" variant="default"><MentorCard title="Decisao anterior" value="Alinhar risco antes da execucao" /></ExperienceCard>
          <ExperienceCard title="Foco da mentoria" variant="default"><MentorCard title="Foco da mentoria" value="Assertividade com consistencia" /></ExperienceCard>
          <ExperienceCard title="Estilo do mentor" variant="default"><MentorCard title="Estilo do mentor" value={mentorResponse?.coach?.mentorMode || 'Coach encorajador'} /></ExperienceCard>
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
                placeholder="Quero ajuda para melhorar minha decisão no cenário de conflito."
                className="mt-1 min-h-28 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
              />
            </label>
            <div className="mentor-quick-prompts">
              {QUICK_PROMPTS.map((prompt) => (
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
            <Button type="submit" disabled={loading || !message.trim()}>{loading ? 'Enviando...' : 'Enviar ao mentor'}</Button>
          </form>
        </ExperienceCard>

        {mentorResponse?.coach ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExperienceCard title="Leitura da situação" variant="result" active>
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
              <p className="text-sm text-muted-700 dark:text-muted-300">Executar nas próximas 24h</p>
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
                  {mentorResponse.gamification.unlockedAchievements.map((achievement) => (
                    <Badge key={achievement.code} variant="achieved">Conquista: {achievement.title}</Badge>
                  ))}
                </div>
              ) : null}
            </ExperienceCard>
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
