import { useMemo, useState } from 'react';
import CardContainer from '../CardContainer.jsx';

const decisionOptions = [
  {
    id: 'containment',
    title: 'Plano de contencao imediato',
    text: 'Atuar no curto prazo com forca tarefa para recuperar conversao em 48h.',
    risk: 'Medio'
  },
  {
    id: 'root-cause',
    title: 'Diagnostico profundo + rollout gradual',
    text: 'Aprofundar causa raiz e liberar melhorias em ondas controladas.',
    risk: 'Baixo'
  },
  {
    id: 'hybrid',
    title: 'Estrategia hibrida por segmento',
    text: 'Contencao nos segmentos criticos e analise dedicada nos demais.',
    risk: 'Medio-baixo'
  }
];

export default function DecisionStage({ decisions, options = [], onUpdate, onConfirm, saving }) {
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const hasSelection = useMemo(() => {
    return decisions.selectedOptionIds.length > 0;
  }, [decisions.selectedOptionIds.length]);

  function toggleSelection(optionId) {
    const selected = new Set(decisions.selectedOptionIds);

    if (isMultiSelect) {
      if (selected.has(optionId)) {
        selected.delete(optionId);
      } else {
        selected.add(optionId);
      }
      onUpdate({ selectedOptionIds: Array.from(selected) });
      return;
    }

    onUpdate({ selectedOptionIds: selected.has(optionId) ? [] : [optionId] });
  }

  async function handleConfirm() {
    if (!hasSelection) return;

    await onConfirm({
      selectedOptionIds: decisions.selectedOptionIds,
      justification: decisions.justification,
      mode: isMultiSelect ? 'multi' : 'single',
      stage: 'decisao',
      capturedAt: new Date().toISOString()
    });
  }

  return (
    <div className="scenario-stage-stack">
      <div className="row-between wrap gap-sm">
        <h2>Decisao estrategica</h2>
        <label className="scenario-toggle">
          <input
            type="checkbox"
            checked={isMultiSelect}
            onChange={(event) => setIsMultiSelect(event.target.checked)}
          />
          <span>Selecao multipla</span>
        </label>
      </div>

      <div className="scenario-cards-grid">
        {(options.length ? options : decisionOptions).map((option) => {
          const selected = decisions.selectedOptionIds.includes(option.id);
          return (
            <CardContainer
              key={option.id}
              as="button"
              interactive
              selected={selected}
              className="accent-decision"
              onClick={() => toggleSelection(option.id)}
            >
              <span className="scenario-kicker">Opcao de decisao</span>
              <h3>{option.title || option.label}</h3>
              <p>{option.text || option.outcomeText || 'Escolha estrategica para conduzir o proximo estado.'}</p>
              <small>Risco estimado: {option.risk || 'calculado pelo motor adaptativo'}</small>
            </CardContainer>
          );
        })}
      </div>

      <CardContainer className="accent-decision-note">
        <span className="scenario-kicker">Justificativa opcional</span>
        <textarea
          value={decisions.justification}
          placeholder="Explique rapidamente seu criterio de decisao..."
          onChange={(event) => onUpdate({ justification: event.target.value })}
        />
      </CardContainer>

      <button onClick={handleConfirm} disabled={!hasSelection || saving}>
        {saving ? 'Enviando...' : 'Confirmar decisao'}
      </button>
    </div>
  );
}
