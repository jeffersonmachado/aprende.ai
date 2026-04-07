import { Badge, Button, Card } from '../ui/index.js';

export default function JourneyMentorPanel({ selectedStep, mentorMessage, onCompleteStep, isCompleting = false }) {
  return (
    <Card className="journey-mentor-panel rounded-3xl border-primary-100/80 shadow-card">
      <div className="journey-mentor-panel-head">
        <div>
          <Badge variant="primary">Mentor IA</Badge>
          <h4 className="text-lg font-semibold text-white">{selectedStep?.title}</h4>
        </div>
        <Badge variant="warning">Etapa ativa</Badge>
      </div>

      <p className="text-sm text-slate-200">{selectedStep?.description}</p>
      <div className="journey-mentor-signal-grid">
        <div>
          <span>Leitura</span>
          <strong>{selectedStep?.status === 'active' ? 'Momento decisivo' : selectedStep?.status === 'completed' ? 'Quadro resolvido' : 'Acesso liberado'}</strong>
        </div>
        <div>
          <span>Recompensa</span>
          <strong>+{selectedStep?.xp || 0} XP</strong>
        </div>
      </div>
      <p className="rounded-2xl border border-orange-200/40 bg-gradient-to-r from-rose-500/18 to-orange-400/12 px-3 py-2 text-sm text-rose-50">
        {mentorMessage}
      </p>

      <Button
        type="button"
        className="w-full rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-primary-500 shadow-premium"
        onClick={onCompleteStep}
        disabled={isCompleting || !selectedStep || selectedStep.status === 'locked' || selectedStep.status === 'completed'}
      >
        {selectedStep?.status === 'completed' ? 'Etapa concluida' : isCompleting ? 'Concluindo...' : 'Concluir etapa'}
      </Button>
    </Card>
  );
}
