function progressBand(progress = 0) {
  if (progress >= 85) return 'ascensao';
  if (progress >= 50) return 'tracao';
  if (progress >= 20) return 'arranque';
  return 'inicio';
}

function celebration(stepTitle, state) {
  return `Excelente. Voce concluiu ${stepTitle} e consolidou ${state.progress}% da jornada. Mantenha o ritmo.`;
}

function provocation(stepTitle, state) {
  if ((state?.streak || 0) >= 4) {
    return `Sua sequencia esta forte. Em ${stepTitle}, tente elevar o nivel: escolha a opcao mais desconfortavel e justifique.`;
  }

  return `Antes de iniciar ${stepTitle}, qual evidencia voce vai usar para provar que aprendeu de verdade?`;
}

export function getMentorMessage(step, state, event = 'step_active') {
  const title = step?.title || 'esta etapa';

  if (event === 'step_completed') {
    return celebration(title, state || {});
  }

  if (event === 'level_up') {
    return `Level up para ${state?.level || 1}. Agora o seu padrao precisa subir junto: mais criterio, menos impulso.`;
  }

  if (event === 'progress') {
    const band = progressBand(state?.progress || 0);

    if (band === 'ascensao') {
      return 'Voce esta na reta final. Foque em consistencia e prepare a transferencia para o proximo desafio.';
    }
    if (band === 'tracao') {
      return 'Metade da jornada concluida. Hora de transformar acertos em metodo replicavel.';
    }
    if (band === 'arranque') {
      return 'Progressao visivel. Mantenha cadencia curta e revisao objetiva a cada etapa.';
    }

    return 'Comeco forte. Execute a etapa com intencao e registre o que mudou na sua decisao.';
  }

  return provocation(title, state || {});
}
