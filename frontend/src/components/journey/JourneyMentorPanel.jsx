import { Badge, Button, Card } from '../ui/index.js';

export default function JourneyMentorPanel({ selectedStep, mentorMessage, onCompleteStep, isCompleting = false }) {
  return (
    <Card className="rounded-3xl border-primary-100/80 bg-white/90 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="primary">Mentor IA</Badge>
        <Badge variant="warning">Etapa ativa</Badge>
      </div>

      <h4 className="text-lg font-semibold text-muted-900">{selectedStep?.title}</h4>
      <p className="text-sm text-muted-600">{selectedStep?.description}</p>
      <p className="rounded-2xl border border-orange-100 bg-gradient-to-r from-rose-50 to-orange-50 px-3 py-2 text-sm text-muted-700">
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
