import { useEffect, useMemo, useState } from 'react';
import { Card, PageHeader, EmptyState, StatCard, StatusPill, FormField, Button, Dialog } from '../components/index.js';
import { api } from '../services/api.js';

export default function TechnicalDashboardPage() {
  const [competencies, setCompetencies] = useState([]);
  const [evolution, setEvolution] = useState(null);
  const [events, setEvents] = useState([]);
  const [rewardRules, setRewardRules] = useState([]);
  const [levelRules, setLevelRules] = useState([]);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [rewardForm, setRewardForm] = useState({ eventType: '', xpAmount: 0, active: true });
  const [levelForm, setLevelForm] = useState({ level: 1, xpRequired: 0, title: '', active: true });

  useEffect(() => {
    Promise.all([
      api.get('/api/competencies'),
      api.get('/api/evolution/me'),
      api.get('/api/integration/events'),
      api.get('/api/gamification/admin/reward-rules'),
      api.get('/api/gamification/admin/level-rules')
    ])
      .then(([competencyData, evolutionData, eventData, rewardRulesData, levelRulesData]) => {
        setCompetencies(competencyData);
        setEvolution(evolutionData);
        setEvents(eventData);
        setRewardRules(rewardRulesData || []);
        setLevelRules(levelRulesData || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const latestEvents = useMemo(() => events.slice(0, 6), [events]);
  const auditEvents = useMemo(
    () => events.filter((e) => e.sourceSystem === 'gamification-admin').slice(0, 20),
    [events]
  );

  async function performSaveRewardRule(payload) {
    setError('');
    try {
      await api.put('/api/gamification/admin/reward-rules', {
        eventType: String(payload.eventType || '').trim(),
        xpAmount: Number(payload.xpAmount || 0),
        active: Boolean(payload.active)
      });
      const [data, refreshedEvents] = await Promise.all([
        api.get('/api/gamification/admin/reward-rules'),
        api.get('/api/integration/events')
      ]);
      setRewardRules(data || []);
      setEvents(refreshedEvents || []);
      setRewardForm({ eventType: '', xpAmount: 0, active: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function performSaveLevelRule(payload) {
    setError('');
    try {
      await api.put('/api/gamification/admin/level-rules', {
        level: Number(payload.level || 1),
        xpRequired: Number(payload.xpRequired || 0),
        title: String(payload.title || '').trim() || `Nível ${Number(payload.level || 1)}`,
        active: Boolean(payload.active)
      });
      const [data, refreshedEvents] = await Promise.all([
        api.get('/api/gamification/admin/level-rules'),
        api.get('/api/integration/events')
      ]);
      setLevelRules(data || []);
      setEvents(refreshedEvents || []);
      setLevelForm({ level: 1, xpRequired: 0, title: '', active: true });
    } catch (err) {
      setError(err.message);
    }
  }

  function saveRewardRule(event) {
    event.preventDefault();
    setPendingAction({
      type: 'reward',
      payload: {
        eventType: String(rewardForm.eventType || '').trim(),
        xpAmount: Number(rewardForm.xpAmount || 0),
        active: Boolean(rewardForm.active)
      }
    });
    setConfirmOpen(true);
  }

  function saveLevelRule(event) {
    event.preventDefault();
    setPendingAction({
      type: 'level',
      payload: {
        level: Number(levelForm.level || 1),
        xpRequired: Number(levelForm.xpRequired || 0),
        title: String(levelForm.title || '').trim(),
        active: Boolean(levelForm.active)
      }
    });
    setConfirmOpen(true);
  }

  async function confirmSaveRule() {
    if (!pendingAction) {
      setConfirmOpen(false);
      return;
    }

    if (pendingAction.type === 'reward') {
      await performSaveRewardRule(pendingAction.payload);
    } else {
      await performSaveLevelRule(pendingAction.payload);
    }

    setPendingAction(null);
    setConfirmOpen(false);
  }

  return (
    <div className="page-stack admin-surface">
      <PageHeader
        eyebrow="Sistema"
        title="Dashboard tecnico"
        description="Integracoes, telemetria, health e dados operacionais com backend como fonte oficial."
      />

      {error ? <div className="error-box">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Eventos" value={events.length} helper="Fila operacional" />
        <StatCard label="Competencias" value={competencies.length} helper="Entidades registradas" />
        <StatCard label="Evolucao" value={`${Number(evolution?.progression?.progressPercent || 0).toFixed(0)}%`} helper="Progresso agregado" />
        <StatCard label="Direction" value={latestEvents[0]?.direction || 'n/d'} helper="Ultimo fluxo" />
      </div>

      <div className="grid-two">
        <Card title="Eventos recentes">
          {latestEvents.length ? (
            <div className="list compact-list">
              {latestEvents.map((event) => (
                <div className="list-item" key={event.id}>
                  <div className="row-between">
                    <strong>{event.eventType}</strong>
                    <StatusPill value={event.status} />
                  </div>
                  <span>{event.sourceSystem} · {event.direction}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem eventos ainda"
              description="Publique eventos em Integracao para validar sincronismo entre sistemas."
            />
          )}
        </Card>

        <Card title="Health operacional">
          <div className="list compact-list">
            <div className="list-item">
              <strong>Source system</strong>
              <p>{latestEvents[0]?.sourceSystem || 'aprende-ai'}</p>
            </div>
            <div className="list-item">
              <strong>Telemetria ativa</strong>
              <p>{events.length ? 'Sim' : 'Aguardando eventos'}</p>
            </div>
            <div className="list-item">
              <strong>Decision history</strong>
              <p>{evolution?.decisionHistory?.length || 0} itens coletados</p>
            </div>
            <div className="list-item">
              <strong>Direction predominante</strong>
              <p>{latestEvents[0]?.direction || 'outbound'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid-two">
        <Card title="Gamificação · Reward rules">
          <form className="stack-form" onSubmit={saveRewardRule}>
            <label>
              Event type
              <input
                value={rewardForm.eventType}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, eventType: e.target.value }))}
                placeholder="Ex: stage_completed"
              />
            </label>
            <label>
              XP
              <input
                type="number"
                value={rewardForm.xpAmount}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, xpAmount: Number(e.target.value || 0) }))}
              />
            </label>
            <label>
              Ativo
              <select
                value={rewardForm.active ? 'true' : 'false'}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </label>
            <Button type="submit">Salvar reward rule</Button>
          </form>

          <div className="list compact-list mt-3">
            {rewardRules.slice(0, 10).map((rule) => (
              <div key={rule.id} className="list-item">
                <div className="row-between">
                  <strong>{rule.eventType}</strong>
                  <StatusPill value={rule.active ? 'active' : 'inactive'} />
                </div>
                <span>XP: {rule.xpAmount}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Gamificação · Level rules">
          <form className="stack-form" onSubmit={saveLevelRule}>
            <label>
              Level
              <input
                type="number"
                min="1"
                value={levelForm.level}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, level: Number(e.target.value || 1) }))}
              />
            </label>
            <label>
              XP required
              <input
                type="number"
                min="0"
                value={levelForm.xpRequired}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, xpRequired: Number(e.target.value || 0) }))}
              />
            </label>
            <label>
              Título
              <input
                value={levelForm.title}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Estrategista"
              />
            </label>
            <label>
              Ativo
              <select
                value={levelForm.active ? 'true' : 'false'}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </label>
            <Button type="submit">Salvar level rule</Button>
          </form>

          <div className="list compact-list mt-3">
            {levelRules.slice(0, 10).map((rule) => (
              <div key={rule.id} className="list-item">
                <div className="row-between">
                  <strong>Nível {rule.level} · {rule.title}</strong>
                  <StatusPill value={rule.active ? 'active' : 'inactive'} />
                </div>
                <span>XP requerido: {rule.xpRequired}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {auditEvents.length > 0 ? (
        <Card title="Histórico de auditoria · Regras de gamificação">
          <div className="list compact-list">
            {auditEvents.map((event) => {
              const pl = event.payload || {};
              const summary = pl.eventType
                ? `reward rule: ${pl.eventType} → ${pl.xpAmount ?? ''} XP`
                : pl.level
                  ? `level rule: nível ${pl.level} → ${pl.xpRequired ?? ''} XP`
                  : JSON.stringify(pl).slice(0, 80);
              const ts = event.processedAt ? new Date(event.processedAt).toLocaleString('pt-BR') : '';
              return (
                <div key={event.id} className="list-item">
                  <div className="row-between">
                    <strong>{event.eventType}</strong>
                    <span className="text-xs text-muted-500">{ts}</span>
                  </div>
                  <span>{summary}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar alteração de regra"
        description="Você está atualizando regras que impactam progressão, XP e nível dos usuários."
        actions={[
          <Button key="cancel" variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>,
          <Button key="confirm" variant="primary" onClick={confirmSaveRule}>
            Confirmar alteração
          </Button>
        ]}
      >
        <p>
          {pendingAction?.type === 'reward'
            ? `Reward rule: ${pendingAction.payload.eventType} -> ${pendingAction.payload.xpAmount} XP`
            : `Level rule: nível ${pendingAction?.payload?.level} -> ${pendingAction?.payload?.xpRequired} XP`}
        </p>
      </Dialog>
    </div>
  );
}
